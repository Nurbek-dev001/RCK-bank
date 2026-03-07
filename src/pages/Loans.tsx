import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

const Loans = () => {
  const [amount, setAmount] = useState(500000);
  const [months, setMonths] = useState(12);
  const { toast } = useToast();
  const rate = 0.18;
  const monthlyPayment = Math.round((amount * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -months)));

  const handleApply = () => {
    toast({ title: "Заявка на займ отправлена!", description: `Сумма: ${amount.toLocaleString()} ₸ на ${months} мес.` });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Займы</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h2 className="font-display text-lg font-semibold">Калькулятор займа</h2>

            <div className="space-y-3">
              <Label>Сумма: {amount.toLocaleString()} ₸</Label>
              <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={50000} max={5000000} step={50000} className="py-2" />
            </div>

            <div className="space-y-3">
              <Label>Срок: {months} месяцев</Label>
              <Slider value={[months]} onValueChange={([v]) => setMonths(v)} min={3} max={60} step={1} className="py-2" />
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ставка</span>
                <span>{(rate * 100)}% годовых</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ежемесячный платёж</span>
                <span className="font-semibold text-primary">{monthlyPayment.toLocaleString()} ₸</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Общая сумма</span>
                <span>{(monthlyPayment * months).toLocaleString()} ₸</span>
              </div>
            </div>

            <Button variant="gold" className="w-full h-11" onClick={handleApply}>
              Оформить заявку
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Ваши займы</h2>
            <div className="p-4 rounded-lg border border-border">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Потребительский кредит</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Активный</span>
              </div>
              <p className="text-2xl font-display font-bold mb-1">750 000 ₸</p>
              <p className="text-sm text-muted-foreground">Остаток: 420 000 ₸ • 18 мес. осталось</p>
              <div className="mt-3 w-full h-2 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gradient-gold" style={{ width: "44%" }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Loans;
