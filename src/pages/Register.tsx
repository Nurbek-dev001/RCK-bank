import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("rck_user", JSON.stringify({ email, role: "user", name }));
    toast({ title: "Аккаунт создан!", description: "Добро пожаловать в RCK BANK" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Landmark className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-gradient-gold">RCK BANK</span>
        </Link>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-center mb-2">Создать аккаунт</h2>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Откройте счёт в RCK BANK за минуту
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-secondary/50 border-border" />
            </div>
            <Button type="submit" variant="gold" className="w-full h-11 text-base">
              Зарегистрироваться
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-primary hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
