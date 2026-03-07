import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PiggyBank, TrendingUp, Shield, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const depositPlans = [
  { name: "Стандарт", rate: 8.5, minAmount: 100000, termMonths: 6, icon: PiggyBank },
  { name: "Премиум", rate: 12, minAmount: 500000, termMonths: 12, icon: TrendingUp },
  { name: "Защита", rate: 10, minAmount: 250000, termMonths: 24, icon: Shield },
];

const Deposits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState(500000);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpId, setTopUpId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  const plan = depositPlans[selected];
  const profit = Math.round(amount * (plan.rate / 100) * (plan.termMonths / 12));

  useEffect(() => { fetchDeposits(); }, [user]);

  const fetchDeposits = async () => {
    if (!user) return;
    const { data } = await supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDeposits(data || []);
    setLoading(false);
  };

  const openDeposit = async () => {
    if (!user) return;
    const closesAt = new Date();
    closesAt.setMonth(closesAt.getMonth() + plan.termMonths);
    const { error } = await supabase.from("deposits").insert({
      user_id: user.id, plan_name: plan.name, amount, interest_rate: plan.rate,
      term_months: plan.termMonths, closes_at: closesAt.toISOString(),
    });
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Депозит открыт!", description: `${plan.name} на ${amount.toLocaleString()} ₸` });
    fetchDeposits();
  };

  const topUpDeposit = async () => {
    if (!topUpId || !topUpAmount) return;
    const deposit = deposits.find(d => d.id === topUpId);
    if (!deposit) return;
    await supabase.from("deposits").update({ amount: Number(deposit.amount) + Number(topUpAmount) }).eq("id", topUpId);
    toast({ title: "Депозит пополнен!" });
    setTopUpId(null);
    setTopUpAmount("");
    fetchDeposits();
  };

  const closeDeposit = async (id: string) => {
    await supabase.from("deposits").update({ status: "closed" }).eq("id", id);
    toast({ title: "Депозит закрыт" });
    fetchDeposits();
  };

  const statusLabels: Record<string, string> = { active: "Активный", closed: "Закрыт", pending: "Ожидание" };
  const statusColors: Record<string, string> = { active: "bg-green-500/10 text-green-400", closed: "bg-muted text-muted-foreground", pending: "bg-primary/10 text-primary" };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Депозиты</h1>

        {/* Plan selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {depositPlans.map((p, i) => (
            <button key={i} onClick={() => { setSelected(i); setAmount(Math.max(amount, p.minAmount)); }}
              className={`p-5 rounded-xl border text-left transition-all ${selected === i ? "border-primary bg-primary/5 glow-gold" : "border-border bg-card hover:border-primary/30"}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{p.name}</h3>
              <p className="text-2xl font-display font-bold text-primary mt-1">{p.rate}%</p>
              <p className="text-sm text-muted-foreground">от {p.minAmount.toLocaleString()} ₸ • {p.termMonths} мес</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-display text-lg font-semibold">Открыть новый депозит</h2>
            <div className="space-y-3">
              <Label>Сумма вклада: {amount.toLocaleString()} ₸</Label>
              <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={plan.minAmount} max={10000000} step={50000} />
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Тариф</span><span>{plan.name} — {plan.rate}% годовых</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Срок</span><span>{plan.termMonths} мес</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Доход</span><span className="font-semibold text-green-400">+{profit.toLocaleString()} ₸</span></div>
            </div>
            <Button variant="gold" className="w-full h-11" onClick={openDeposit}>Открыть депозит</Button>
          </div>

          {/* My deposits */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Ваши депозиты</h2>
            {deposits.length === 0 ? (
              <p className="text-muted-foreground text-sm">У вас нет депозитов</p>
            ) : deposits.map((d) => (
              <div key={d.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-semibold">{d.plan_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>{statusLabels[d.status]}</span>
                </div>
                <p className="text-2xl font-display font-bold">{Number(d.amount).toLocaleString()} ₸</p>
                <p className="text-sm text-muted-foreground">{d.interest_rate}% • {d.term_months} мес • Доход: +{Number(d.accrued_interest ?? 0).toLocaleString()} ₸</p>
                {d.status === "active" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => { setTopUpId(d.id); setTopUpAmount(""); }}>
                      <Plus className="w-3 h-3 mr-1" /> Пополнить
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => closeDeposit(d.id)}>
                      <X className="w-3 h-3 mr-1" /> Закрыть
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top-up dialog */}
        <Dialog open={!!topUpId} onOpenChange={(open) => !open && setTopUpId(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Пополнить депозит</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Сумма пополнения (₸)</Label>
                <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="bg-secondary/50 border-border" />
              </div>
              <Button variant="gold" className="w-full" onClick={topUpDeposit}>Пополнить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default Deposits;
