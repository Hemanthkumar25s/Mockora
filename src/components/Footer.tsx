import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg mb-4">
            <div className="gradient-primary rounded-lg p-1.5">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            InterviewAce
          </Link>
          <p className="text-sm text-muted-foreground">
            AI-powered mock interviews to land your dream job.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Product</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Practice</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/interview/hr" className="hover:text-primary transition-colors">HR Interview</Link>
            <Link to="/interview/technical" className="hover:text-primary transition-colors">Technical</Link>
            <Link to="/coding" className="hover:text-primary transition-colors">Coding Practice</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="cursor-default">About</span>
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Terms</span>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 InterviewAce. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
