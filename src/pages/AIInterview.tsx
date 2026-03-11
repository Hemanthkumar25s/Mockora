import { useState, useRef, useEffect, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Bot,
  User,
  Send,
  RotateCcw,
  Mic,
  MicOff,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Trophy,
  ArrowRight,
} from "lucide-react";

type Role = "hr" | "technical" | "behavioral";

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
    greeting:
      "Hello! I'm your AI interviewer for today's HR round. I'll be asking you a series of behavioral and situational questions. Take your time, and answer as you would in a real interview. Let's begin!",
    questions: [
      "Tell me about yourself. Walk me through your background and what brings you here today.",
      "What would you say is your greatest professional strength, and can you give me an example of how you've used it?",
      "Describe a time when you faced a significant challenge at work. How did you handle it?",
      "Why are you interested in this role and our company specifically?",
      "Where do you see yourself professionally in the next 3-5 years?",
      "Tell me about a time you had a conflict with a colleague. How did you resolve it?",
      "What motivates you to do your best work every day?",
    ],
  },
  technical: {
    label: "Technical Interview",
    greeting:
      "Hi there! I'm your AI technical interviewer. I'll ask you conceptual and problem-solving questions to assess your technical knowledge. Think out loud — I want to understand your reasoning process. Ready? Let's start!",
    questions: [
      "Can you explain the difference between REST and GraphQL? When would you choose one over the other?",
      "Walk me through how you would design a URL shortener service like bit.ly. What components would you need?",
      "What is the difference between SQL and NoSQL databases? Give me a scenario where each would be the better choice.",
      "Explain the concept of time complexity. What's the difference between O(n) and O(n log n)?",
      "How does HTTPS work? Can you walk me through the TLS handshake at a high level?",
      "What are microservices, and what are the trade-offs compared to a monolithic architecture?",
      "Describe how you would optimize a web application that has slow page load times.",
    ],
  },
  behavioral: {
    label: "Behavioral Interview",
    greeting:
      "Welcome! I'm your AI behavioral interviewer. I'll be focusing on real-life situations from your experience using the STAR method (Situation, Task, Action, Result). Be specific and honest. Let's get started!",
    questions: [
      "Tell me about a time you took initiative on a project without being asked.",
      "Describe a situation where you had to learn something new quickly to complete a task.",
      "Give me an example of a time you had to work with a difficult team member. What did you do?",
      "Tell me about a time you failed at something. What did you learn from it?",
      "Describe a situation where you had to make a decision with incomplete information.",
      "Give me an example of when you went above and beyond what was expected of you.",
      "Tell me about a time you received critical feedback. How did you respond?",
    ],
  },
};

const evaluateAnswer = (answer: string, questionIndex: number) => {
  const words = answer.trim().split(/\s+/).length;
  const hasExample = /for example|for instance|such as|when i|i once|at my/i.test(answer);
  const hasStructure = /first|then|finally|result|outcome|because/i.test(answer);
  let score = Math.min(95, Math.max(25, words * 2.5 + (hasExample ? 15 : 0) + (hasStructure ? 10 : 0) + Math.floor(Math.random() * 10)));
  return Math.round(score);
};

const generateFollowUp = (answer: string, score: number): string => {
  if (score >= 80) {
    const responses = [
      "Great answer! I liked how specific you were. Let me move on to the next question.",
      "Excellent response. Your use of concrete examples really strengthened your answer. Next question:",
      "Very well articulated. That's exactly the kind of depth interviewers look for. Moving on:",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  if (score >= 55) {
    const responses = [
      "Good start. Try to include more specific examples next time. Let's continue:",
      "Decent answer, but quantifiable results would make it stronger. Here's the next one:",
      "Not bad! Consider using the STAR framework for more structure. Next question:",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  const responses = [
    "I'd encourage you to elaborate more. Specific examples make a big difference. Let's try another:",
    "That was a bit brief — interviewers want to see depth and real scenarios. Next question:",
    "Try to give more detail in your response. Let's move to the next one:",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateReport = (scores: number[]): FinalReport => {
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  return {
    overallScore: avg,
    strengths: avg >= 70
      ? ["Clear communication style", "Good use of real examples", "Confident delivery"]
      : avg >= 50
      ? ["Willingness to answer all questions", "Basic understanding shown"]
      : ["Completed the full interview session"],
    improvements: avg >= 70
      ? ["Add more quantifiable achievements", "Vary your sentence structure"]
      : avg >= 50
      ? ["Use the STAR method for better structure", "Include specific metrics and outcomes", "Elaborate with more detail"]
      : ["Practice answering with concrete examples", "Use structured frameworks like STAR", "Aim for 2-3 minute responses", "Research common interview questions"],
    tip:
      avg >= 70
        ? "You're interview-ready! Focus on tailoring answers to each company's values."
        : "Practice daily with a timer. Record yourself and review your responses for clarity and depth.",
  };
};

const AIInterview = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [report, setReport] = useState<FinalReport | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
  }, []);

  const { isListening, isSupported, toggleListening, stopListening } =
    useSpeechRecognition(handleVoiceTranscript);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startInterview = (role: Role) => {
    setSelectedRole(role);
    const config = roleConfig[role];
    const greeting: Message = { id: 1, sender: "ai", text: config.greeting, timestamp: new Date() };
    setMessages([greeting]);
    setIsTyping(true);
    setTimeout(() => {
      const firstQ: Message = { id: 2, sender: "ai", text: config.questions[0], timestamp: new Date() };
      setMessages((prev) => [...prev, firstQ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim() || !selectedRole || isTyping) return;

    const userMsg: Message = { id: Date.now(), sender: "user", text: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    const score = evaluateAnswer(input, currentQ);
    const newScores = [...scores, score];
    setScores(newScores);
    setInput("");
    setIsTyping(true);

    const config = roleConfig[selectedRole];
    const nextIndex = currentQ + 1;

    setTimeout(() => {
      if (nextIndex < config.questions.length) {
        const followUp = generateFollowUp(input, score);
        const aiReply: Message = { id: Date.now() + 1, sender: "ai", text: followUp, timestamp: new Date() };
        setMessages((prev) => [...prev, aiReply]);

        setTimeout(() => {
          const nextQ: Message = { id: Date.now() + 2, sender: "ai", text: config.questions[nextIndex], timestamp: new Date() };
          setMessages((prev) => [...prev, nextQ]);
          setCurrentQ(nextIndex);
          setIsTyping(false);
        }, 1200);
      } else {
        const closing: Message = {
          id: Date.now() + 1,
          sender: "ai",
          text: "That's all my questions! Thank you for your time. Let me compile your interview report...",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, closing]);
        setTimeout(() => {
          setReport(generateReport(newScores));
          setIsTyping(false);
        }, 2000);
      }
    }, 1000 + Math.random() * 800);
  };

  const resetInterview = () => {
    setSelectedRole(null);
    setMessages([]);
    setInput("");
    setCurrentQ(0);
    setScores([]);
    setReport(null);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Role selection screen
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
                Experience a realistic interview simulation with our AI interviewer. Choose your interview type to begin.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-5">
              {(Object.entries(roleConfig) as [Role, typeof roleConfig.hr][]).map(([key, config], i) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => startInterview(key)}
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-glow transition-all duration-300 text-left"
                >
                  <div className="gradient-primary rounded-xl p-2.5 w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{config.label}</h3>
                  <p className="text-sm text-muted-foreground">{config.questions.length} questions • ~15 min</p>
                  <div className="flex items-center gap-1 mt-4 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Start Interview <ArrowRight className="h-4 w-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 pb-4 flex flex-col">
        <div className="container mx-auto px-4 max-w-3xl flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-xl p-2">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">{roleConfig[selectedRole].label}</h2>
                <p className="text-xs text-muted-foreground">
                  Question {Math.min(currentQ + 1, roleConfig[selectedRole].questions.length)} of{" "}
                  {roleConfig[selectedRole].questions.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetInterview}>
              <RotateCcw className="h-4 w-4" /> New Interview
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 mb-4">
            <div
              className="gradient-primary h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${((currentQ + (report ? 1 : 0)) / roleConfig[selectedRole].questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[55vh] pr-2 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="gradient-primary rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div className="rounded-full bg-muted p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
                <div className="gradient-primary rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
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

          {/* Report */}
          {report && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <div className="p-6 rounded-2xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <h3 className="font-display font-bold text-lg">Interview Report</h3>
                  </div>
                  <div
                    className={`text-3xl font-display font-bold ${
                      report.overallScore >= 80
                        ? "text-success"
                        : report.overallScore >= 55
                        ? "text-accent"
                        : "text-destructive"
                    }`}
                  >
                    {report.overallScore}%
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="font-medium text-sm">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-accent" />
                      <span className="font-medium text-sm">Areas to Improve</span>
                    </div>
                    <ul className="space-y-1">
                      {report.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{report.tip}</p>
                </div>

                <Button variant="hero" size="lg" className="w-full mt-5" onClick={resetInterview}>
                  <RotateCcw className="h-4 w-4" /> Start New Interview
                </Button>
              </div>
            </motion.div>
          )}

          {/* Input */}
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
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={`h-[60px] w-[60px] shrink-0 ${isListening ? "animate-pulse" : ""}`}
                  onClick={toggleListening}
                  disabled={isTyping}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              )}
              <Button
                variant="hero"
                size="icon"
                className="h-[60px] w-[60px] shrink-0"
                onClick={() => { stopListening(); handleSend(); }}
                disabled={!input.trim() || isTyping}
              >
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
