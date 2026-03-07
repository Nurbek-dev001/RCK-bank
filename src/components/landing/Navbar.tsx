import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Landmark className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-gradient-gold">RCK BANK</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Войти</Link>
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link to="/register">Регистрация</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
