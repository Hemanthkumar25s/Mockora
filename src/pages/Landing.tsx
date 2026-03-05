import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Code, MessageSquare, Trophy, BarChart3, Shield, Sparkles, CheckCircle, Zap, Star, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: MessageSquare, title: "HR Interviews", desc: "Practice behavioral questions with AI-powered feedback on your responses." },
  { icon: Code, title: "Coding Challenges", desc: "Solve real coding problems with an integrated editor and test cases." },
  { icon: Brain, title: "AI Feedback", desc: "Get instant, detailed analysis of your strengths and weaknesses." },
  { icon: Trophy, title: "Leaderboard", desc: "Compete with peers and track your ranking among top performers." },
  { icon: BarChart3, title: "Analytics", desc: "Visualize your progress with detailed performance charts." },
  { icon: Shield, title: "Company-Specific", desc: "Practice questions tailored to your target companies." },
];

const stats = [
  { value: "50K+", label: "Interviews Taken" },
  { value: "95%", label: "Success Rate" },
  { value: "200+", label: "Companies Covered" },
  { value: "4.9★", label: "User Rating" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["5 interviews per day", "Basic HR questions", "Limited coding questions", "Community support"],
    cta: "Get Started",
    variant: "hero-outline" as const,
    popular: false,
  },
  {
    name: "Premium Monthly",
    price: "$19",
    period: "/month",
    features: ["Unlimited interviews", "Company-specific questions", "Advanced coding challenges", "Detailed AI feedback", "Analytics dashboard", "Priority support"],
    cta: "Upgrade Now",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Premium Yearly",
    price: "$149",
    period: "/year",
    features: ["Everything in Monthly", "Save 35%", "Early access to features", "1-on-1 coaching session", "Resume review", "Exclusive community"],
    cta: "Best Value",
    variant: "hero-outline" as const,
    popular: false,
  },
];

const Landing = () => (
  <div className="min-h-screen">
    <Navbar />

    {/* Hero */}
    <section className="gradient-hero relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Interview Practice
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6">
            Ace Every Interview with{" "}
            <span className="text-gradient">AI Coaching</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
            Practice technical and HR interviews with intelligent feedback. Get company-specific questions, real-time scoring, and personalized improvement plans.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Practicing Free <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/features">See How It Works</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-16 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 md:py-32" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Everything You Need to <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From behavioral questions to system design, we've got every aspect of your interview preparation covered.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-glow hover:border-primary/30 transition-all duration-300"
            >
              <div className="gradient-primary rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section className="py-20 md:py-32 bg-muted/50" id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg">Pay with crypto. Cancel anytime.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border bg-card ${
                plan.popular ? "border-primary shadow-glow scale-105" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Most Popular
                </div>
              )}
              <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.variant} size="lg" className="w-full" asChild>
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="gradient-hero rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of candidates who landed their dream jobs with InterviewAce.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Free Today <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Landing;
