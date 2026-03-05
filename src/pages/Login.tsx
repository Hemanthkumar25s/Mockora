import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just redirect
    toast({ title: "Welcome back!", description: "Redirecting to dashboard..." });
    setTimeout(() => window.location.href = "/dashboard", 1000);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-strong rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="gradient-primary rounded-xl p-2.5 w-fit mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-2xl text-primary-foreground">Welcome Back</h1>
            <p className="text-primary-foreground/60 text-sm mt-1">Sign in to continue practicing</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-primary-foreground/80">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 bg-background/10 border-border/30 text-primary-foreground placeholder:text-primary-foreground/30"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-primary-foreground/80">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-background/10 border-border/30 text-primary-foreground placeholder:text-primary-foreground/30 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/50">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <Button variant="hero" size="lg" className="w-full" type="submit">Sign In</Button>
          </form>
          <p className="text-center text-sm text-primary-foreground/60 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
