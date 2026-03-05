import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Code, Play, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const problems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starterCode: `function twoSum(nums, target) {\n  // Write your solution here\n  \n}`,
    testCases: [
      { input: "twoSum([2,7,11,15], 9)", expected: "[0,1]" },
      { input: "twoSum([3,2,4], 6)", expected: "[1,2]" },
    ],
  },
  {
    title: "Reverse String",
    difficulty: "Easy",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    starterCode: `function reverseString(s) {\n  // Write your solution here\n  \n}`,
    testCases: [
      { input: 'reverseString(["h","e","l","l","o"])', expected: '["o","l","l","e","h"]' },
      { input: 'reverseString(["H","a"])', expected: '["a","H"]' },
    ],
  },
];

const CodingPractice = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [code, setCode] = useState(problems[0].starterCode);
  const [output, setOutput] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string }[] | null>(null);

  const problem = problems[currentProblem];

  const handleRun = () => {
    // Simulated execution
    const results = problem.testCases.map((tc) => ({
      passed: Math.random() > 0.3,
      input: tc.input,
      expected: tc.expected,
    }));
    setTestResults(results);
    setOutput(results.every((r) => r.passed) ? "All test cases passed! ✅" : "Some test cases failed.");
  };

  const switchProblem = (idx: number) => {
    setCurrentProblem(idx);
    setCode(problems[idx].starterCode);
    setOutput(null);
    setTestResults(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="gradient-primary rounded-xl p-2.5">
                <Code className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Coding Practice</h1>
                <p className="text-sm text-muted-foreground">Solve problems and run tests</p>
              </div>
            </div>

            {/* Problem tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {problems.map((p, i) => (
                <button
                  key={i}
                  onClick={() => switchProblem(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    i === currentProblem ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {p.title}
                  <span className={`ml-2 text-xs ${p.difficulty === "Easy" ? "text-success" : "text-accent"}`}>
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Problem description */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-card">
                <h2 className="font-display font-bold text-xl mb-2">{problem.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${problem.difficulty === "Easy" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"}`}>
                  {problem.difficulty}
                </span>
                <p className="text-sm text-muted-foreground mt-4">{problem.description}</p>

                <h3 className="font-display font-semibold text-sm mt-6 mb-3">Test Cases</h3>
                <div className="space-y-2">
                  {problem.testCases.map((tc, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted text-xs font-mono">
                      <div><span className="text-muted-foreground">Input:</span> {tc.input}</div>
                      <div><span className="text-muted-foreground">Expected:</span> {tc.expected}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code editor */}
              <div className="flex flex-col">
                <div className="flex-1 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                    <span className="text-xs font-mono text-muted-foreground">solution.js</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setCode(problem.starterCode); setOutput(null); setTestResults(null); }}>
                        <RotateCcw className="h-3 w-3" /> Reset
                      </Button>
                      <Button variant="hero" size="sm" onClick={handleRun}>
                        <Play className="h-3 w-3" /> Run
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full min-h-[300px] p-4 bg-transparent font-mono text-sm resize-none focus:outline-none"
                    spellCheck={false}
                  />
                </div>

                {/* Output */}
                {testResults && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl border border-border bg-card">
                    <h3 className="font-display font-semibold text-sm mb-3">Results</h3>
                    <div className="space-y-2">
                      {testResults.map((r, i) => (
                        <div key={i} className={`flex items-center gap-2 p-3 rounded-lg text-xs font-mono ${r.passed ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}>
                          {r.passed ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                          <span>{r.input}</span>
                        </div>
                      ))}
                    </div>
                    {output && <p className="mt-3 text-sm font-medium">{output}</p>}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CodingPractice;
