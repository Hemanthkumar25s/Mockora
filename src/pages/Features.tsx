import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Brain, Code, MessageSquare, Shield, BarChart3, Trophy, Sparkles, Zap, Target, BookOpen } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "HR Interview Practice", desc: "Practice with realistic behavioral and situational questions. Get AI feedback on your communication, structure, and content." },
  { icon: Code, title: "Coding Challenges", desc: "Solve problems in an integrated code editor with real-time test case validation. Covers arrays, trees, graphs, and more." },
  { icon: Brain, title: "AI-Powered Feedback", desc: "Receive instant, detailed analysis of your answers with scoring, strengths, weaknesses, and actionable improvement tips." },
  { icon: Target, title: "Company-Specific Prep", desc: "Practice questions tailored to specific companies like Google, Amazon, Meta, and more. Premium feature." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Track your progress over time with detailed charts showing improvement trends, weak areas, and practice consistency." },
  { icon: Trophy, title: "Leaderboard & Rankings", desc: "Compete with other candidates. See how you rank and stay motivated with streak tracking." },
  { icon: Shield, title: "System Design Questions", desc: "Practice designing scalable systems with guided questions covering load balancing, caching, databases, and microservices." },
  { icon: BookOpen, title: "Interview History", desc: "Review all your past interviews, answers, and feedback. Learn from your mistakes and track improvement." },
  { icon: Sparkles, title: "Personalized Recommendations", desc: "Get smart question recommendations based on your performance, weak areas, and target companies." },
];

const Features = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-28 pb-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4" /> Platform Features
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Built for Interview <span className="text-gradient">Success</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature is designed to simulate real interviews and provide actionable feedback.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-glow hover:border-primary/30 transition-all duration-300"
            >
              <div className="gradient-primary rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Features;
