import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PiggyBank, TrendingUp, Shield } from "lucide-react";

const depositPlans = [
  { name: "Стандарт", rate: 8.5, minAmount: 100000, term: "6 мес", icon: PiggyBank },
  { name: "Премиум", rate: 12, minAmount: 500000, term: "12 мес", icon: TrendingUp },
  { name: "Защита", rate: 10, minAmount: 250000, term: "24 мес", icon: Shield },
];

const Deposits = () => {
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState(500000);
  const { toast } = useToast();

  const plan = depositPlans[selected];
  const profit = Math.round(amount * (plan.rate / 100));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Депозиты</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {depositPlans.map((p, i) => (
            <button
              key={i}
              onClick={() => { setSelected(i); setAmount(Math.max(amount, p.minAmount)); }}
              className={`p-5 rounded-xl border text-left transition-all ${
                selected === i ? "border-primary bg-primary/5 glow-gold" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{p.name}</h3>
              <p className="text-2xl font-display font-bold text-primary mt-1">{p.rate}%</p>
              <p className="text-sm text-muted-foreground">от {p.minAmount.toLocaleString()} ₸ • {p.term}</p>
            </button>
          ))}
        </div>

        <div className="max-w-lg bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="space-y-3">
            <Label>Сумма вклада: {amount.toLocaleString()} ₸</Label>
            <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={plan.minAmount} max={10000000} step={50000} />
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Тариф</span>
              <span>{plan.name} — {plan.rate}% годовых</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Срок</span>
              <span>{plan.term}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Доход</span>
              <span className="font-semibold text-green-400">+{profit.toLocaleString()} ₸</span>
            </div>
          </div>

          <Button variant="gold" className="w-full h-11" onClick={() => toast({ title: "Депозит открыт!", description: `${plan.name} на ${amount.toLocaleString()} ₸` })}>
            Открыть депозит
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Deposits;
