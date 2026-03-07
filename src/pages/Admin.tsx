import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, Users, ArrowLeftRight, Wallet, PiggyBank, TrendingUp, LogOut, Search, MoreHorizontal, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const mockUsers = [
  { id: 1, name: "Алексей Кузнецов", email: "alexey@mail.com", balance: 1250000, status: "active", loans: 1, deposits: 500000 },
  { id: 2, name: "Мария Иванова", email: "maria@mail.com", balance: 3400000, status: "active", loans: 0, deposits: 1200000 },
  { id: 3, name: "Дмитрий Ли", email: "dmitry@mail.com", balance: 85000, status: "blocked", loans: 2, deposits: 0 },
  { id: 4, name: "Айжан Нурланова", email: "aizhan@mail.com", balance: 920000, status: "active", loans: 1, deposits: 300000 },
  { id: 5, name: "Тимур Бекет", email: "timur@mail.com", balance: 4500000, status: "active", loans: 0, deposits: 2000000 },
];

const adminStats = [
  { label: "Пользователи", value: "12 458", icon: Users, color: "text-primary" },
  { label: "Переводы сегодня", value: "3 241", icon: ArrowLeftRight, color: "text-blue-400" },
  { label: "Активные займы", value: "1 892", icon: Wallet, color: "text-orange-400" },
  { label: "Сумма депозитов", value: "8.2 млрд ₸", icon: PiggyBank, color: "text-green-400" },
];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(mockUsers);

  useEffect(() => {
    const stored = localStorage.getItem("rck_user");
    if (!stored) { navigate("/login"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin") { navigate("/dashboard"); return; }
  }, [navigate]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (id: number) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "blocked" : "active" } : u));
    toast({ title: "Статус обновлён" });
  };

  const handleLogout = () => {
    localStorage.removeItem("rck_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Admin sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Landmark className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-gradient-gold">RCK ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { title: "Обзор", icon: TrendingUp, active: true },
            { title: "Пользователи", icon: Users },
            { title: "Транзакции", icon: ArrowLeftRight },
            { title: "Займы", icon: Wallet },
            { title: "Депозиты", icon: PiggyBank },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Выйти
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold mb-6">Панель администратора</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {adminStats.map((s, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="font-display text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Users */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Пользователи</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium">Имя</th>
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-right py-3 px-2 font-medium">Баланс</th>
                    <th className="text-center py-3 px-2 font-medium">Займы</th>
                    <th className="text-right py-3 px-2 font-medium">Депозиты</th>
                    <th className="text-center py-3 px-2 font-medium">Статус</th>
                    <th className="text-center py-3 px-2 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-3 px-2 font-medium">{u.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-2 text-right">{u.balance.toLocaleString()} ₸</td>
                      <td className="py-3 px-2 text-center">{u.loans}</td>
                      <td className="py-3 px-2 text-right">{u.deposits.toLocaleString()} ₸</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          u.status === "active" ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"
                        }`}>
                          {u.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          {u.status === "active" ? "Активен" : "Заблокирован"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleBlock(u.id)}>
                          {u.status === "active" ? <Ban className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
