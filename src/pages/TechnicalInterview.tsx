import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Brain, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const questions: Question[] = [
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
    explanation: "Binary search divides the search space in half each iteration, giving O(log n) complexity.",
    category: "Algorithms",
  },
  {
    question: "Which React hook is used for side effects?",
    options: ["useState", "useReducer", "useEffect", "useMemo"],
    correct: 2,
    explanation: "useEffect is designed for handling side effects like data fetching, subscriptions, and DOM mutations.",
    category: "React",
  },
  {
    question: "What does REST stand for?",
    options: ["Representational State Transfer", "Remote Execution State Transfer", "Real-time Event Stream Transfer", "Resource Endpoint Service Technology"],
    correct: 0,
    explanation: "REST stands for Representational State Transfer, an architectural style for distributed systems.",
    category: "System Design",
  },
  {
    question: "Which data structure uses FIFO ordering?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    correct: 1,
    explanation: "A Queue follows First-In-First-Out (FIFO) ordering where the first element added is the first removed.",
    category: "Data Structures",
  },
  {
    question: "What is the purpose of an index in a database?",
    options: ["Store data", "Speed up queries", "Encrypt data", "Backup data"],
    correct: 1,
    explanation: "Database indexes create a data structure that allows for faster lookup operations on specific columns.",
    category: "Databases",
  },
];

const TechnicalInterview = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((p) => p + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="gradient-primary rounded-xl p-2.5">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Technical Interview</h1>
                <p className="text-sm text-muted-foreground">Multiple choice questions</p>
              </div>
            </div>

            {!finished ? (
              <>
                <div className="w-full bg-muted rounded-full h-2 mb-8">
                  <div className="gradient-primary h-2 rounded-full transition-all duration-500" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                </div>

                <div className="p-6 rounded-2xl border border-border bg-card shadow-card mb-6">
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">{q.category} • Question {currentQ + 1}/{questions.length}</span>
                  <p className="text-lg font-display font-semibold mt-2">{q.question}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {q.options.map((opt, i) => {
                    let style = "border-border bg-card hover:border-primary/30";
                    if (selected !== null) {
                      if (i === q.correct) style = "border-success bg-success/10";
                      else if (i === selected) style = "border-destructive bg-destructive/10";
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${style} ${selected === null ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-display font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm font-medium">{opt}</span>
                          {selected !== null && i === q.correct && <CheckCircle className="h-5 w-5 text-success ml-auto" />}
                          {selected !== null && i === selected && i !== q.correct && <XCircle className="h-5 w-5 text-destructive ml-auto" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                      <p className="text-sm text-muted-foreground">{q.explanation}</p>
                    </div>
                    <Button variant="hero" size="lg" onClick={handleNext}>
                      {currentQ + 1 >= questions.length ? "See Results" : "Next Question"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className={`text-6xl font-display font-bold mb-4 ${score / questions.length >= 0.8 ? "text-success" : score / questions.length >= 0.5 ? "text-accent" : "text-destructive"}`}>
                  {Math.round((score / questions.length) * 100)}%
                </div>
                <p className="text-xl font-display font-semibold mb-2">
                  {score}/{questions.length} Correct
                </p>
                <p className="text-muted-foreground mb-8">
                  {score === questions.length ? "Perfect score! 🎉" : score >= 3 ? "Great job! Keep practicing." : "Keep studying, you'll improve!"}
                </p>
                <Button variant="hero" size="lg" onClick={restart}>Try Again</Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TechnicalInterview;
