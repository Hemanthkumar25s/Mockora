import { useState, useRef, useEffect, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot, User, Send, RotateCcw, Mic, MicOff, CheckCircle, AlertCircle,
  Lightbulb, Trophy, Phone, PhoneOff, Volume2,
} from "lucide-react";

type Role = "hr" | "technical" | "behavioral";
type InterviewMode = "text" | "voice";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
}

interface FinalReport {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  tip: string;
}

const roleConfig: Record<Role, { label: string; greeting: string; questions: string[] }> = {
  hr: {
    label: "HR Interview",
    greeting: "Hello! I'm your AI interviewer for today's HR round. I'll be asking you behavioral and situational questions. Let's begin!",
    questions: [
      "Tell me about yourself. Walk me through your background and what brings you here today.",
      "What would you say is your greatest professional strength, and can you give me an example?",
      "Describe a time when you faced a significant challenge at work. How did you handle it?",
      "Why are you interested in this role and our company specifically?",
      "Where do you see yourself professionally in the next 3-5 years?",
      "Tell me about a time you had a conflict with a colleague. How did you resolve it?",
      "What motivates you to do your best work every day?",
    ],
  },
  technical: {
    label: "Technical Interview",
    greeting: "Hi there! I'm your AI technical interviewer. Think out loud — I want to understand your reasoning. Ready? Let's start!",
    questions: [
      "Can you explain the difference between REST and GraphQL?",
      "Walk me through how you would design a URL shortener service.",
      "What is the difference between SQL and NoSQL databases?",
      "Explain the concept of time complexity. What's the difference between O(n) and O(n log n)?",
      "How does HTTPS work? Walk me through the TLS handshake.",
      "What are microservices, and what are the trade-offs vs monolithic architecture?",
      "Describe how you would optimize a slow web application.",
    ],
  },
  behavioral: {
    label: "Behavioral Interview",
    greeting: "Welcome! I'll focus on real-life situations using the STAR method. Be specific and honest. Let's get started!",
    questions: [
      "Tell me about a time you took initiative on a project without being asked.",
      "Describe a situation where you had to learn something new quickly.",
      "Give an example of working with a difficult team member.",
      "Tell me about a time you failed. What did you learn?",
      "Describe a situation where you made a decision with incomplete information.",
      "Give an example of going above and beyond expectations.",
      "Tell me about receiving critical feedback. How did you respond?",
    ],
  },
};

const evaluateAnswer = (answer: string) => {
  const words = answer.trim().split(/\s+/).length;
  const hasExample = /for example|for instance|such as|when i|i once|at my/i.test(answer);
  const hasStructure = /first|then|finally|result|outcome|because/i.test(answer);
  return Math.round(Math.min(95, Math.max(25, words * 2.5 + (hasExample ? 15 : 0) + (hasStructure ? 10 : 0) + Math.floor(Math.random() * 10))));
};

const generateFollowUp = (score: number): string => {
  if (score >= 80) return ["Great answer! Very specific. Moving on:", "Excellent response with concrete examples. Next:", "Well articulated. Next question:"][Math.floor(Math.random() * 3)];
  if (score >= 55) return ["Good start. More examples would help. Continuing:", "Decent, but quantifiable results would strengthen it. Next:", "Not bad! Try the STAR framework. Next:"][Math.floor(Math.random() * 3)];
  return ["I'd encourage more detail. Let's try another:", "That was brief — interviewers want depth. Next:", "Try more detail next time. Moving on:"][Math.floor(Math.random() * 3)];
};

const generateReport = (scores: number[]): FinalReport => {
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  return {
    overallScore: avg,
    strengths: avg >= 70 ? ["Clear communication", "Good examples", "Confident delivery"] : avg >= 50 ? ["Willingness to answer", "Basic understanding"] : ["Completed the session"],
    improvements: avg >= 70 ? ["Add quantifiable achievements", "Vary sentence structure"] : avg >= 50 ? ["Use STAR method", "Include metrics", "Elaborate more"] : ["Practice with examples", "Use STAR framework", "Aim for 2-3 min responses"],
    tip: avg >= 70 ? "You're interview-ready! Tailor answers to each company." : "Practice daily. Record and review for clarity.",
  };
};

const AIInterview = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [interviewMode, setInterviewMode] = useState<InterviewMode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Voice (Vapi) state
  const [vapiCallActive, setVapiCallActive] = useState(false);
  const [vapiLoading, setVapiLoading] = useState(false);
  const [vapiStatus, setVapiStatus] = useState<string>("idle");
  const [vapiTranscripts, setVapiTranscripts] = useState<{ role: string; text: string }[]>([]);
  const [vapiVolume, setVapiVolume] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
  }, []);

  const { isListening, isSupported, toggleListening, stopListening } = useSpeechRecognition(handleVoiceTranscript);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, vapiTranscripts]);

  // Cleanup Vapi on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  const createSession = async (role: Role) => {
    if (!user) return null;
    const { data } = await supabase
      .from("interview_sessions")
      .insert({ user_id: user.id, interview_type: role })
      .select("id")
      .single();
    return data?.id ?? null;
  };

  const saveResponse = async (sid: string, qIndex: number, qText: string, answer: string, score: number, feedback: string) => {
    await supabase.from("user_responses").insert({
      session_id: sid,
      question_index: qIndex,
      question_text: qText,
      answer_text: answer,
      score,
      ai_feedback: feedback,
    });
  };

  const completeSession = async (sid: string, finalReport: FinalReport) => {
    await supabase
      .from("interview_sessions")
      .update({
        overall_score: finalReport.overallScore,
        strengths: finalReport.strengths,
        improvements: finalReport.improvements,
        tip: finalReport.tip,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sid);
  };

  /* ───────── TEXT CHAT ───────── */
  const startTextInterview = async (role: Role) => {
    setSelectedRole(role);
    setInterviewMode("text");
    const config = roleConfig[role];
    const greeting: Message = { id: 1, sender: "ai", text: config.greeting, timestamp: new Date() };
    setMessages([greeting]);
    setIsTyping(true);

    const sid = await createSession(role);
    if (sid) setSessionId(sid);

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: 2, sender: "ai", text: config.questions[0], timestamp: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedRole || isTyping) return;

    const userMsg: Message = { id: Date.now(), sender: "user", text: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    const score = evaluateAnswer(input);
    const newScores = [...scores, score];
    setScores(newScores);
    const answerText = input.trim();
    setInput("");
    setIsTyping(true);

    const config = roleConfig[selectedRole];
    const nextIndex = currentQ + 1;
    const followUp = generateFollowUp(score);

    if (sessionId) {
      saveResponse(sessionId, currentQ, config.questions[currentQ], answerText, score, followUp);
    }

    setTimeout(() => {
      if (nextIndex < config.questions.length) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: followUp, timestamp: new Date() }]);
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: Date.now() + 2, sender: "ai", text: config.questions[nextIndex], timestamp: new Date() }]);
          setCurrentQ(nextIndex);
          setIsTyping(false);
        }, 1200);
      } else {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: "That's all! Let me compile your report...", timestamp: new Date() }]);
        setTimeout(() => {
          const finalReport = generateReport(newScores);
          setReport(finalReport);
          if (sessionId) completeSession(sessionId, finalReport);
          setIsTyping(false);
        }, 2000);
      }
    }, 1000 + Math.random() * 800);
  };

  /* ───────── VOICE AI (VAPI) ───────── */
  const startVoiceInterview = async (role: Role) => {
    setSelectedRole(role);
    setInterviewMode("voice");
    setVapiLoading(true);
    setVapiTranscripts([]);
    setVapiStatus("connecting");

    const sid = await createSession(role);
    if (sid) setSessionId(sid);

    try {
      const config = roleConfig[role];

      // Call our edge function to create a web call
      const { data, error } = await supabase.functions.invoke("vapi-session", {
        body: {
          assistantConfig: {
            systemPrompt: `You are a professional ${config.label} interviewer conducting a real-time voice interview. Ask these questions one by one, waiting for the candidate to fully respond before moving on:\n\n${config.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nAfter each answer, give brief encouraging feedback (1-2 sentences). After all questions are done, provide:\n- An overall score out of 100\n- Top 3 strengths\n- Top 3 areas for improvement\n- One actionable tip\n\nBe warm, professional, and conversational. Do NOT rush through questions.`,
            firstMessage: config.greeting + " Are you ready to start?",
            endCallMessage: "Thank you for the interview! You did great. Good luck!",
          },
        },
      });

      if (error) throw error;

      // The edge function returns web call data with webCallUrl
      if (data?.webCallUrl) {
        // Initialize Vapi client and join the web call
        const vapi = new Vapi(data.webCallUrl);
        vapiRef.current = vapi;

        vapi.on("call-start", () => {
          setVapiCallActive(true);
          setVapiLoading(false);
          setVapiStatus("active");
        });

        vapi.on("call-end", () => {
          setVapiCallActive(false);
          setVapiStatus("ended");
          // Save session as completed
          if (sid) {
            const finalReport: FinalReport = {
              overallScore: 75,
              strengths: ["Completed voice interview", "Real-time conversation", "Verbal communication"],
              improvements: ["Review the transcript for areas to improve", "Practice speaking clearly"],
              tip: "Voice interviews test your verbal fluency — practice speaking your answers out loud daily.",
            };
            setReport(finalReport);
            completeSession(sid, finalReport);
          }
        });

        vapi.on("message", (msg: any) => {
          if (msg.type === "transcript") {
            setVapiTranscripts((prev) => [
              ...prev,
              { role: msg.role === "assistant" ? "ai" : "user", text: msg.transcript },
            ]);
          }
        });

        vapi.on("volume-level", (level: number) => {
          setVapiVolume(level);
        });

        vapi.on("error", (err: any) => {
          console.error("Vapi error:", err);
          setVapiLoading(false);
          setVapiStatus("error");
        });

        // Start the call
        vapi.start();
      } else {
        throw new Error("No webCallUrl returned from server");
      }
    } catch (err) {
      console.error("Vapi error:", err);
      setVapiLoading(false);
      setVapiStatus("error");
    }
  };

  const endVapiCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setVapiCallActive(false);
    setVapiStatus("ended");
  };

  const resetInterview = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setSelectedRole(null);
    setInterviewMode(null);
    setMessages([]);
    setInput("");
    setCurrentQ(0);
    setScores([]);
    setReport(null);
    setIsTyping(false);
    setSessionId(null);
    setVapiCallActive(false);
    setVapiLoading(false);
    setVapiStatus("idle");
    setVapiTranscripts([]);
    setVapiVolume(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ───────── ROLE SELECTION SCREEN ───────── */
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="gradient-primary rounded-2xl p-3 w-fit mx-auto mb-6">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">AI 1-on-1 Interview</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Choose <strong>Text Chat</strong> to type your answers, or <strong>Voice AI</strong> for a real-time spoken interview with an AI interviewer.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-3 gap-5">
              {(Object.entries(roleConfig) as [Role, typeof roleConfig.hr][]).map(([key, config], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-glow transition-all duration-300"
                >
                  <div className="gradient-primary rounded-xl p-2.5 w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{config.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{config.questions.length} questions • ~15 min</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="hero" size="sm" className="w-full" onClick={() => startTextInterview(key)}>
                      <Send className="h-4 w-4 mr-1" /> Text Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary/30 hover:bg-primary/10"
                      onClick={() => startVoiceInterview(key)}
                      disabled={vapiLoading}
                    >
                      <Phone className="h-4 w-4 mr-1" /> {vapiLoading ? "Connecting..." : "Voice AI"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ───────── VOICE INTERVIEW SCREEN ───────── */
  if (interviewMode === "voice") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-20 pb-4 flex flex-col">
          <div className="container mx-auto px-4 max-w-3xl flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="gradient-primary rounded-xl p-2"><Bot className="h-5 w-5 text-primary-foreground" /></div>
                <div>
                  <h2 className="font-display font-bold text-lg">{roleConfig[selectedRole].label} — Voice</h2>
                  <p className="text-xs text-muted-foreground">Real-time voice interview with AI</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetInterview}><RotateCcw className="h-4 w-4 mr-1" /> New</Button>
            </div>

            {/* Voice Call UI */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {vapiLoading && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 gradient-primary rounded-full animate-pulse opacity-30" />
                    <div className="absolute inset-4 gradient-primary rounded-full animate-pulse opacity-50" style={{ animationDelay: "300ms" }} />
                    <div className="absolute inset-8 gradient-primary rounded-full flex items-center justify-center">
                      <Phone className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl">Connecting...</p>
                    <p className="text-sm text-muted-foreground mt-1">Setting up your voice interview</p>
                  </div>
                </motion.div>
              )}

              {vapiCallActive && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 w-full">
                  {/* Animated voice visualizer */}
                  <div className="relative mx-auto w-40 h-40">
                    <div
                      className="absolute inset-0 gradient-primary rounded-full opacity-20 transition-transform duration-150"
                      style={{ transform: `scale(${1 + vapiVolume * 0.5})` }}
                    />
                    <div
                      className="absolute inset-4 gradient-primary rounded-full opacity-40 transition-transform duration-150"
                      style={{ transform: `scale(${1 + vapiVolume * 0.3})` }}
                    />
                    <div className="absolute inset-8 gradient-primary rounded-full flex items-center justify-center">
                      <Volume2 className="h-10 w-10 text-primary-foreground" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                      <p className="font-display font-bold text-xl">Interview in Progress</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Speak naturally — the AI is listening and will respond</p>
                  </div>

                  {/* Live transcript */}
                  <div className="w-full max-h-[40vh] overflow-y-auto space-y-3 mt-6 px-2">
                    {vapiTranscripts.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${t.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {t.role === "ai" && (
                          <div className="gradient-primary rounded-full p-1.5 h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          t.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card border border-border rounded-bl-md"
                        }`}>
                          {t.text}
                        </div>
                        {t.role === "user" && (
                          <div className="rounded-full bg-muted p-1.5 h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* End call button */}
                  <Button variant="destructive" size="lg" className="mt-4" onClick={endVapiCall}>
                    <PhoneOff className="h-5 w-5 mr-2" /> End Interview
                  </Button>
                </motion.div>
              )}

              {vapiStatus === "error" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                  <p className="font-display font-bold text-lg">Connection Failed</p>
                  <p className="text-sm text-muted-foreground">Could not connect to the voice AI. Please try again.</p>
                  <Button variant="hero" onClick={resetInterview}><RotateCcw className="h-4 w-4 mr-1" /> Try Again</Button>
                </motion.div>
              )}

              {vapiStatus === "ended" && report && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-card">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /><h3 className="font-display font-bold text-lg">Interview Report</h3></div>
                      <div className={`text-3xl font-display font-bold ${report.overallScore >= 80 ? "text-success" : report.overallScore >= 55 ? "text-accent" : "text-destructive"}`}>{report.overallScore}%</div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                        <div className="flex items-center gap-2 mb-2"><CheckCircle className="h-4 w-4 text-success" /><span className="font-medium text-sm">Strengths</span></div>
                        <ul className="space-y-1">{report.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
                      </div>
                      <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                        <div className="flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4 text-accent" /><span className="font-medium text-sm">Areas to Improve</span></div>
                        <ul className="space-y-1">{report.improvements.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                      <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{report.tip}</p>
                    </div>
                    <Button variant="hero" size="lg" className="w-full mt-5" onClick={resetInterview}><RotateCcw className="h-4 w-4" /> Start New Interview</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───────── TEXT CHAT SCREEN ───────── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 pb-4 flex flex-col">
        <div className="container mx-auto px-4 max-w-3xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-xl p-2"><Bot className="h-5 w-5 text-primary-foreground" /></div>
              <div>
                <h2 className="font-display font-bold text-lg">{roleConfig[selectedRole].label}</h2>
                <p className="text-xs text-muted-foreground">
                  Question {Math.min(currentQ + 1, roleConfig[selectedRole].questions.length)} of {roleConfig[selectedRole].questions.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetInterview}><RotateCcw className="h-4 w-4" /> New</Button>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 mb-4">
            <div className="gradient-primary h-1.5 rounded-full transition-all duration-700" style={{ width: `${((currentQ + (report ? 1 : 0)) / roleConfig[selectedRole].questions.length) * 100}%` }} />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[55vh] pr-2 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "ai" && (
                    <div className="gradient-primary rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1"><Bot className="h-4 w-4 text-primary-foreground" /></div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border rounded-bl-md"}`}>
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div className="rounded-full bg-muted p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1"><User className="h-4 w-4 text-muted-foreground" /></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
                <div className="gradient-primary rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-primary-foreground" /></div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {report && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <div className="p-6 rounded-2xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /><h3 className="font-display font-bold text-lg">Interview Report</h3></div>
                  <div className={`text-3xl font-display font-bold ${report.overallScore >= 80 ? "text-success" : report.overallScore >= 55 ? "text-accent" : "text-destructive"}`}>{report.overallScore}%</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle className="h-4 w-4 text-success" /><span className="font-medium text-sm">Strengths</span></div>
                    <ul className="space-y-1">{report.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4 text-accent" /><span className="font-medium text-sm">Areas to Improve</span></div>
                    <ul className="space-y-1">{report.improvements.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{report.tip}</p>
                </div>
                <Button variant="hero" size="lg" className="w-full mt-5" onClick={resetInterview}><RotateCcw className="h-4 w-4" /> Start New Interview</Button>
              </div>
            </motion.div>
          )}

          {!report && (
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder={isListening ? "Listening..." : "Type your answer or use the mic..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className={`min-h-[60px] max-h-[120px] resize-none flex-1 transition-colors ${isListening ? "border-primary ring-2 ring-primary/20" : ""}`}
              />
              {isSupported && (
                <Button variant={isListening ? "destructive" : "outline"} size="icon" className={`h-[60px] w-[60px] shrink-0 ${isListening ? "animate-pulse" : ""}`} onClick={toggleListening} disabled={isTyping}>
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              )}
              <Button variant="hero" size="icon" className="h-[60px] w-[60px] shrink-0" onClick={() => { stopListening(); handleSend(); }} disabled={!input.trim() || isTyping}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInterview;
