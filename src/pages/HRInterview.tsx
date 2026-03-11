import { useState, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, RotateCcw, Send, CheckCircle, AlertCircle, Lightbulb, Mic, MicOff } from "lucide-react";

const hrQuestions = [
  "Tell me about yourself and your background.",
  "What is your greatest strength?",
  "Describe a challenging situation at work and how you handled it.",
  "Why do you want to work at our company?",
  "Where do you see yourself in 5 years?",
  "Tell me about a time you demonstrated leadership.",
  "How do you handle stress and pressure?",
  "What motivates you in your career?",
];

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestion: string;
}

const generateFeedback = (answer: string): Feedback => {
  const wordCount = answer.trim().split(/\s+/).length;
  const score = Math.min(95, Math.max(30, wordCount * 3 + Math.floor(Math.random() * 20)));
  return {
    score,
    strengths: wordCount > 20
      ? ["Good level of detail", "Clear communication"]
      : ["Concise response"],
    improvements: wordCount < 15
      ? ["Add more specific examples", "Elaborate on your experience"]
      : ["Consider using the STAR method"],
    suggestion: "Try to include quantifiable achievements and specific examples from your experience.",
  };
};

const HRInterview = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleVoiceTranscript = useCallback((text: string) => {
    setAnswer((prev) => (prev ? prev + " " + text : text));
  }, []);

  const { isListening, isSupported, toggleListening, stopListening } =
    useSpeechRecognition(handleVoiceTranscript);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    stopListening();
    setFeedback(generateFeedback(answer));
    setSubmitted(true);
  };

  const nextQuestion = () => {
    setCurrentQ((prev) => (prev + 1) % hrQuestions.length);
    setAnswer("");
    setFeedback(null);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="gradient-primary rounded-xl p-2.5">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">HR Interview</h1>
                <p className="text-sm text-muted-foreground">Question {currentQ + 1} of {hrQuestions.length}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-muted rounded-full h-2 mb-8">
              <div className="gradient-primary h-2 rounded-full transition-all duration-500" style={{ width: `${((currentQ + 1) / hrQuestions.length) * 100}%` }} />
            </div>

            {/* Question */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-card mb-6">
              <p className="text-xs text-primary font-medium uppercase tracking-wider mb-2">Question</p>
              <p className="text-lg font-display font-semibold">{hrQuestions[currentQ]}</p>
            </div>

            {/* Answer */}
            <div className="mb-6">
              <Textarea
                placeholder={isListening ? "Listening..." : "Type your answer or use the mic..."}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted}
                className={`min-h-[150px] resize-none ${isListening ? "border-primary ring-2 ring-primary/20" : ""}`}
              />
              {isSupported && !submitted && (
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  className={`mt-3 ${isListening ? "animate-pulse" : ""}`}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isListening ? "Stop Recording" : "Voice Input"}
                </Button>
              )}
            </div>

            {!submitted ? (
              <Button variant="hero" size="lg" onClick={handleSubmit} disabled={!answer.trim()}>
                <Send className="h-4 w-4" /> Submit Answer
              </Button>
            ) : (
              <Button variant="hero" size="lg" onClick={nextQuestion}>
                <RotateCcw className="h-4 w-4" /> Next Question
              </Button>
            )}

            {/* Feedback */}
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
                <div className="p-6 rounded-2xl border border-border bg-card shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">AI Feedback</h3>
                    <div className={`text-2xl font-display font-bold ${feedback.score >= 80 ? "text-success" : feedback.score >= 60 ? "text-accent" : "text-destructive"}`}>
                      {feedback.score}%
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium text-sm">Strengths</span>
                      </div>
                      <ul className="space-y-1">
                        {feedback.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-accent" />
                        <span className="font-medium text-sm">Improvements</span>
                      </div>
                      <ul className="space-y-1">
                        {feedback.improvements.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{feedback.suggestion}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HRInterview;
