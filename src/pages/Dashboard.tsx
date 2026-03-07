import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, PiggyBank, ArrowLeftRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";

const stats = [
  { label: "Баланс", value: "1 250 000 ₸", icon: Wallet, change: "+2.5%" },
  { label: "Доход за месяц", value: "320 000 ₸", icon: TrendingUp, change: "+12%" },
  { label: "Активные займы", value: "1", icon: ArrowLeftRight, change: "" },
  { label: "Депозиты", value: "500 000 ₸", icon: PiggyBank, change: "+8.5% годовых" },
];

const transactions = [
  { id: 1, name: "Перевод Алексею К.", amount: -25000, date: "Сегодня, 14:32", type: "out" },
  { id: 2, name: "Зарплата", amount: 320000, date: "Вчера, 09:00", type: "in" },
  { id: 3, name: "Оплата Kaspi магазин", amount: -12500, date: "5 мар, 18:45", type: "out" },
  { id: 4, name: "Перевод от Марии", amount: 50000, date: "4 мар, 11:20", type: "in" },
  { id: 5, name: "Коммуналка", amount: -35000, date: "3 мар, 08:00", type: "out" },
];

const quickActions = [
  { title: "Перевод", icon: ArrowLeftRight, url: "/dashboard/transfers", color: "bg-primary/10 text-primary" },
  { title: "Займ", icon: Wallet, url: "/dashboard/loans", color: "bg-blue-500/10 text-blue-400" },
  { title: "Депозит", icon: PiggyBank, url: "/dashboard/deposits", color: "bg-green-500/10 text-green-400" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Обзор</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="font-display text-xl font-bold">{s.value}</p>
              {s.change && <p className="text-xs text-green-400 mt-1">{s.change}</p>}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <h2 className="font-display text-lg font-semibold mb-4">Последние операции</h2>
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "in" ? "bg-green-500/10" : "bg-destructive/10"}`}>
                      {t.type === "in" ? (
                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === "in" ? "text-green-400" : "text-destructive"}`}>
                    {t.type === "in" ? "+" : ""}{t.amount.toLocaleString()} ₸
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Быстрые действия</h2>
            {quickActions.map((a, i) => (
              <Link
                key={i}
                to={a.url}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
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
