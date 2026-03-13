import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Brain, Bot, Code, MessageSquare, Trophy, ArrowRight, Clock, Star, TrendingUp, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface InterviewSession {
  id: string;
  interview_type: string;
  overall_score: number | null;
  started_at: string;
  completed_at: string | null;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [sessionsRes, profileRes] = await Promise.all([
        supabase
          .from("interview_sessions")
          .select("id, interview_type, overall_score, started_at, completed_at")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(10),
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      ]);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const completedSessions = sessions.filter((s) => s.overall_score !== null);
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((a, b) => a + (b.overall_score ?? 0), 0) / completedSessions.length)
    : 0;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hr": return MessageSquare;
      case "technical": return Code;
      case "behavioral": return Brain;
      default: return Bot;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-1">Welcome back, {displayName}! 👋</h1>
              <p className="text-muted-foreground">Continue your interview preparation journey.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Interviews", value: sessions.length, icon: MessageSquare, color: "text-primary" },
              { label: "Avg Score", value: avgScore ? `${avgScore}%` : "—", icon: TrendingUp, color: "text-success" },
              { label: "Completed", value: completedSessions.length, icon: Trophy, color: "text-accent" },
              { label: "Plan", value: "Free", icon: Star, color: "text-warning" },
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
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
              {sessions.length === 0 ? (
                <div className="p-8 rounded-xl border border-border bg-card text-center">
                  <p className="text-muted-foreground">No interviews yet. Start one above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session) => {
                    const Icon = getTypeIcon(session.interview_type);
                    return (
                      <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                        <div className="gradient-primary rounded-lg p-2">
                          <Icon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm capitalize">{session.interview_type} Interview</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(session.started_at)}</span>
                            {!session.completed_at && <span className="text-accent">• In progress</span>}
                          </div>
                        </div>
                        {session.overall_score !== null && (
                          <div className={`text-sm font-display font-bold ${session.overall_score >= 80 ? "text-success" : session.overall_score >= 60 ? "text-accent" : "text-destructive"}`}>
                            {session.overall_score}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="gradient-hero rounded-xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-accent" />
                    <span className="text-primary-foreground/80 text-sm font-medium">Free Plan</span>
                  </div>
                  <h3 className="font-display font-bold text-primary-foreground text-lg mb-2">Go Pro</h3>
                  <p className="text-primary-foreground/60 text-sm mb-4">Unlock unlimited interviews and voice AI for just ₹499/month.</p>
                  <Button variant="accent" size="sm" asChild>
                    <Link to="/pricing">Upgrade <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
