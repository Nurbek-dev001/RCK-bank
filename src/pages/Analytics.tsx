import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingDown, TrendingUp, ShoppingBag, Utensils, Car, Gamepad2, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const categoryLabels: Record<string, string> = {
  transfer: "Переводы", payment: "Платежи", deposit: "Депозиты", loan_payment: "Оплата займа",
  salary: "Зарплата", shopping: "Покупки", food: "Еда", transport: "Транспорт",
  entertainment: "Развлечения", other: "Другое",
};

const categoryColors: Record<string, string> = {
  transfer: "#f59e0b", payment: "#3b82f6", deposit: "#22c55e", loan_payment: "#ef4444",
  salary: "#8b5cf6", shopping: "#ec4899", food: "#f97316", transport: "#06b6d4",
  entertainment: "#a855f7", other: "#6b7280",
};

const categoryIcons: Record<string, typeof BarChart3> = {
  shopping: ShoppingBag, food: Utensils, transport: Car, entertainment: Gamepad2,
};

const Analytics = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { setTransactions(data || []); setLoading(false); });
  }, [user]);

  const expenses = transactions.filter(t => !t.is_income);
  const incomeT = transactions.filter(t => t.is_income);
  const totalExpense = expenses.reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalIncome = incomeT.reduce((s: number, t: any) => s + Number(t.amount), 0);

  // Category breakdown
  const categoryData = Object.entries(
    expenses.reduce((acc: Record<string, number>, t: any) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount); return acc; }, {} as Record<string, number>)
  ).map(([key, value]) => ({ name: categoryLabels[key] || key, value: value as number, color: categoryColors[key] || "#6b7280" }))
   .sort((a, b) => b.value - a.value);

  // Monthly chart (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString("ru", { month: "short" });
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const exp = expenses.filter((t: any) => t.created_at.startsWith(monthStr)).reduce((s: number, t: any) => s + Number(t.amount), 0);
    const inc = incomeT.filter((t: any) => t.created_at.startsWith(monthStr)).reduce((s: number, t: any) => s + Number(t.amount), 0);
    return { month, expense: exp, income: inc };
  });

  // Recommendations
  const recommendations: string[] = [];
  if (categoryData.find(c => c.name === "Развлечения" && c.value > totalExpense * 0.3)) {
    recommendations.push("Расходы на развлечения превышают 30% от общих трат. Попробуйте оптимизировать.");
  }
  if (totalExpense > totalIncome * 0.9) {
    recommendations.push("Расходы близки к доходам. Рекомендуем создать резервный фонд.");
  }
  if (categoryData.length === 0) {
    recommendations.push("Начните делать переводы и платежи, чтобы увидеть аналитику.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Ваши финансы в хорошем состоянии! Продолжайте в том же духе.");
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Финансовая аналитика</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><TrendingUp className="w-4 h-4 text-green-400" /> Доходы</div>
            <p className="font-display text-xl font-bold text-green-400">+{totalIncome.toLocaleString()} ₸</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><TrendingDown className="w-4 h-4 text-destructive" /> Расходы</div>
            <p className="font-display text-xl font-bold text-destructive">-{totalExpense.toLocaleString()} ₸</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Zap className="w-4 h-4 text-primary" /> Баланс</div>
            <p className="font-display text-xl font-bold">{(totalIncome - totalExpense).toLocaleString()} ₸</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-display text-lg font-semibold mb-4">Расходы по месяцам</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8 }} />
                <Bar dataKey="income" fill="hsl(145, 63%, 42%)" name="Доходы" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" name="Расходы" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-display text-lg font-semibold mb-4">Категории расходов</h2>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {categoryData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-sm">
                  {categoryData.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="font-medium ml-auto">{c.value.toLocaleString()} ₸</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Нет данных для отображения</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-display text-lg font-semibold mb-4">💡 Рекомендации</h2>
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Analytics;
