import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Crown, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for getting started",
    features: ["5 interviews per day", "Basic HR questions", "Limited coding questions", "Community support", "Basic feedback"],
    cta: "Get Started Free",
    variant: "hero-outline" as const,
    popular: false,
  },
  {
    name: "Premium Monthly",
    price: "$19",
    period: "/month",
    desc: "For serious interview preparation",
    features: ["Unlimited interviews", "Company-specific questions", "Advanced coding challenges", "Detailed AI feedback", "Analytics dashboard", "Priority support", "System design practice"],
    cta: "Start Premium",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Premium Yearly",
    price: "$149",
    period: "/year",
    desc: "Best value — save 35%",
    features: ["Everything in Monthly", "Save 35% annually", "Early access to features", "1-on-1 coaching session", "Resume review", "Exclusive community", "Interview guarantee"],
    cta: "Get Best Value",
    variant: "hero-outline" as const,
    popular: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-28 pb-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4" /> Simple Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Invest in Your <span className="text-gradient">Career</span>
          </h1>
          <p className="text-muted-foreground text-lg">Pay with cryptocurrency via Cryptomus. Cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border bg-card ${plan.popular ? "border-primary shadow-glow scale-105" : "border-border"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Most Popular
                </div>
              )}
              <h3 className="font-display font-bold text-xl">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.desc}</p>
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-12 text-sm text-muted-foreground">
          🔒 Secure payments powered by Cryptomus cryptocurrency gateway
        </motion.div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Pricing;
