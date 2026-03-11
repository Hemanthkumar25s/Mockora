import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Brain, Bot, Code, MessageSquare, Trophy, ArrowRight, Clock, Star, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const mockStats = {
  totalInterviews: 24,
  avgScore: 78,
  streak: 5,
  rank: 142,
};

const recentInterviews = [
  { id: 1, type: "HR", title: "Behavioral Interview", score: 85, date: "Today", icon: MessageSquare },
  { id: 2, type: "Technical", title: "React & TypeScript", score: 72, date: "Yesterday", icon: Code },
  { id: 3, type: "Coding", title: "Array Problems", score: 90, date: "2 days ago", icon: Brain },
];

const recommendations = [
  { title: "System Design Basics", category: "Technical", difficulty: "Medium" },
  { title: "Tell me about yourself", category: "HR", difficulty: "Easy" },
  { title: "Two Sum Problem", category: "Coding", difficulty: "Easy" },
  { title: "STAR Method Practice", category: "HR", difficulty: "Medium" },
];

const Dashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-1">Welcome back, Alex! 👋</h1>
          <p className="text-muted-foreground">Continue your interview preparation journey.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Interviews", value: mockStats.totalInterviews, icon: MessageSquare, color: "text-primary" },
            { label: "Avg Score", value: `${mockStats.avgScore}%`, icon: TrendingUp, color: "text-success" },
            { label: "Day Streak", value: mockStats.streak, icon: Zap, color: "text-accent" },
            { label: "Rank", value: `#${mockStats.rank}`, icon: Trophy, color: "text-warning" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl border border-border bg-card shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <h2 className="font-display font-semibold text-lg mb-4">Start Practicing</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { to: "/interview/hr", icon: MessageSquare, title: "HR Interview", desc: "Behavioral questions", gradient: "gradient-primary" },
                { to: "/interview/technical", icon: Brain, title: "Technical", desc: "MCQ & system design", gradient: "gradient-accent" },
              { to: "/coding", icon: Code, title: "Coding", desc: "Solve problems", gradient: "gradient-primary" },
              { to: "/interview/ai", icon: Bot, title: "AI 1-on-1", desc: "Live AI interview", gradient: "gradient-accent" },
              ].map((action) => (
                <Link key={action.to} to={action.to} className="group p-5 rounded-xl border border-border bg-card hover:shadow-glow hover:border-primary/30 transition-all duration-300">
                  <div className={`${action.gradient} rounded-lg p-2.5 w-fit mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold">{action.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                </Link>
              ))}
            </div>

            {/* Recent Interviews */}
            <h2 className="font-display font-semibold text-lg mb-4">Recent Interviews</h2>
            <div className="space-y-3">
              {recentInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="gradient-primary rounded-lg p-2">
                    <interview.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{interview.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{interview.type}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{interview.date}</span>
                    </div>
                  </div>
                  <div className={`text-sm font-display font-bold ${interview.score >= 80 ? "text-success" : interview.score >= 60 ? "text-accent" : "text-destructive"}`}>
                    {interview.score}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {/* Premium Card */}
            <div className="gradient-hero rounded-xl p-6 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80 text-sm font-medium">Free Plan</span>
                </div>
                <h3 className="font-display font-bold text-primary-foreground text-lg mb-2">Go Premium</h3>
                <p className="text-primary-foreground/60 text-sm mb-4">Unlock unlimited interviews and advanced features.</p>
                <Button variant="accent" size="sm" asChild>
                  <Link to="/pricing">Upgrade <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>

            {/* Recommendations */}
            <h2 className="font-display font-semibold text-lg mb-4">Recommended</h2>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="font-medium text-sm">{rec.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{rec.category}</span>
                    <span className="text-xs text-muted-foreground">{rec.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Dashboard;
