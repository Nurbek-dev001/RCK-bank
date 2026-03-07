import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, PiggyBank, ArrowLeftRight, CreditCard, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { title: "Карты", icon: CreditCard, url: "/dashboard/cards", color: "bg-primary/10 text-primary" },
  { title: "Перевод", icon: ArrowLeftRight, url: "/dashboard/transfers", color: "bg-blue-500/10 text-blue-400" },
  { title: "Кредит", icon: Wallet, url: "/dashboard/loans", color: "bg-orange-500/10 text-orange-400" },
  { title: "Депозит", icon: PiggyBank, url: "/dashboard/deposits", color: "bg-green-500/10 text-green-400" },
  { title: "Аналитика", icon: BarChart3, url: "/dashboard/analytics", color: "bg-purple-500/10 text-purple-400" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cardsCount, setCardsCount] = useState(0);
  const [loansCount, setLoansCount] = useState(0);
  const [depositsTotal, setDepositsTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setTransactions(data || []));
    supabase.from("cards").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "active")
      .then(({ count }) => setCardsCount(count ?? 0));
    supabase.from("loans").select("id", { count: "exact" }).eq("user_id", user.id).in("status", ["approved", "active"])
      .then(({ count }) => setLoansCount(count ?? 0));
    supabase.from("deposits").select("amount").eq("user_id", user.id).eq("status", "active")
      .then(({ data }) => setDepositsTotal((data || []).reduce((s, d) => s + Number(d.amount), 0)));
  }, [user]);

  const totalIncome = transactions.filter(t => t.is_income).reduce((s, t) => s + Number(t.amount), 0);

  const stats = [
    { label: "Активные карты", value: String(cardsCount), icon: CreditCard, change: "" },
    { label: "Доход за период", value: `${totalIncome.toLocaleString()} ₸`, icon: TrendingUp, change: "" },
    { label: "Активные кредиты", value: String(loansCount), icon: Wallet, change: "" },
    { label: "Депозиты", value: `${depositsTotal.toLocaleString()} ₸`, icon: PiggyBank, change: "" },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Обзор</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="font-display text-xl font-bold">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <h2 className="font-display text-lg font-semibold mb-4">Последние операции</h2>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">Нет операций</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.is_income ? "bg-green-500/10" : "bg-destructive/10"}`}>
                        {t.is_income ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.description || t.recipient_name || "Операция"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("ru")}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.is_income ? "text-green-400" : "text-destructive"}`}>
                      {t.is_income ? "+" : "-"}{Number(t.amount).toLocaleString()} ₸
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Быстрые действия</h2>
            {quickActions.map((a, i) => (
              <Link key={i} to={a.url} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.color}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{a.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
