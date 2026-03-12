import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Crown, Zap, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    desc: "Get started with basic practice",
    features: [
      { text: "2 interviews per month", included: true },
      { text: "Basic HR questions", included: true },
      { text: "Limited coding questions", included: true },
      { text: "Community support", included: true },
      { text: "Advanced AI feedback", included: false },
      { text: "Interview analytics", included: false },
      { text: "Voice AI interviews", included: false },
    ],
    cta: "Get Started Free",
    variant: "hero-outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    desc: "Unlimited access for serious prep",
    features: [
      { text: "Unlimited interviews", included: true },
      { text: "All question categories", included: true },
      { text: "Advanced AI feedback", included: true },
      { text: "Interview analytics", included: true },
      { text: "Voice AI interviews (Vapi)", included: true },
      { text: "Priority support", included: true },
      { text: "Detailed score breakdown", included: true },
    ],
    cta: "Upgrade to Pro",
    variant: "hero" as const,
    popular: true,
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
          <p className="text-muted-foreground text-lg">Choose the plan that fits your preparation needs.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
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
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={f.included ? "" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.variant} size="lg" className="w-full" asChild>
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Comparison note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-12 text-sm text-muted-foreground">
          All prices in Indian Rupees (₹ INR). Cancel anytime.
        </motion.div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Pricing;
