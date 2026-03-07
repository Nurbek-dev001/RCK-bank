import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, Users, ArrowLeftRight, Wallet, PiggyBank, TrendingUp, LogOut, Search, Ban, CheckCircle, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, txToday: 0, activeLoans: 0, totalDeposits: 0 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate(user ? "/dashboard" : "/login");
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [profilesRes, txRes, loansRes, depositsRes, cardsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("loans").select("*").order("created_at", { ascending: false }),
      supabase.from("deposits").select("*").order("created_at", { ascending: false }),
      supabase.from("cards").select("*").order("created_at", { ascending: false }),
    ]);

    setProfiles(profilesRes.data || []);
    setTransactions(txRes.data || []);
    setLoans(loansRes.data || []);
    setDeposits(depositsRes.data || []);
    setCards(cardsRes.data || []);

    const today = new Date().toISOString().split("T")[0];
    setStats({
      users: (profilesRes.data || []).length,
      txToday: (txRes.data || []).filter(t => t.created_at.startsWith(today)).length,
      activeLoans: (loansRes.data || []).filter(l => l.status === "approved" || l.status === "active").length,
      totalDeposits: (depositsRes.data || []).filter(d => d.status === "active").reduce((s, d) => s + Number(d.amount), 0),
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.user_id?.includes(search)
  );

  if (loading || !isAdmin) return null;

  const adminStats = [
    { label: "Пользователи", value: String(stats.users), icon: Users, color: "text-primary" },
    { label: "Транзакции сегодня", value: String(stats.txToday), icon: ArrowLeftRight, color: "text-blue-400" },
    { label: "Активные кредиты", value: String(stats.activeLoans), icon: Wallet, color: "text-orange-400" },
    { label: "Сумма депозитов", value: `${stats.totalDeposits.toLocaleString()} ₸`, icon: PiggyBank, color: "text-green-400" },
  ];

  const sidebarItems = [
    { title: "Обзор", icon: TrendingUp },
    { title: "Пользователи", icon: Users },
    { title: "Транзакции", icon: ArrowLeftRight },
    { title: "Кредиты", icon: Wallet },
    { title: "Депозиты", icon: PiggyBank },
    { title: "Карты", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex bg-background">
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
          {sidebarItems.map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${i === 0 ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
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

          <Tabs defaultValue="users">
            <TabsList className="bg-secondary/50 mb-6">
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="transactions">Транзакции</TabsTrigger>
              <TabsTrigger value="loans">Кредиты</TabsTrigger>
              <TabsTrigger value="deposits">Депозиты</TabsTrigger>
              <TabsTrigger value="cards">Карты</TabsTrigger>
            </TabsList>

            {/* Users tab */}
            <TabsContent value="users">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">Пользователи ({profiles.length})</h2>
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
                        <th className="text-left py-3 px-2 font-medium">ID</th>
                        <th className="text-center py-3 px-2 font-medium">Скоринг</th>
                        <th className="text-left py-3 px-2 font-medium">Дата регистрации</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map((p) => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-2 font-medium">{p.full_name || "—"}</td>
                          <td className="py-3 px-2 text-muted-foreground text-xs font-mono">{p.user_id?.slice(0, 8)}...</td>
                          <td className="py-3 px-2 text-center">{p.credit_score}</td>
                          <td className="py-3 px-2 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("ru")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Transactions tab */}
            <TabsContent value="transactions">
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Последние транзакции</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2 font-medium">Дата</th>
                        <th className="text-left py-3 px-2 font-medium">Категория</th>
                        <th className="text-left py-3 px-2 font-medium">Описание</th>
                        <th className="text-right py-3 px-2 font-medium">Сумма</th>
                        <th className="text-left py-3 px-2 font-medium">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-2 text-muted-foreground">{new Date(t.created_at).toLocaleString("ru")}</td>
                          <td className="py-3 px-2">{t.category}</td>
                          <td className="py-3 px-2">{t.description || "—"}</td>
                          <td className={`py-3 px-2 text-right font-medium ${t.is_income ? "text-green-400" : "text-destructive"}`}>
                            {t.is_income ? "+" : "-"}{Number(t.amount).toLocaleString()} ₸
                          </td>
                          <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{t.user_id?.slice(0, 8)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Loans tab */}
            <TabsContent value="loans">
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Все кредиты</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2 font-medium">Тип</th>
                        <th className="text-right py-3 px-2 font-medium">Сумма</th>
                        <th className="text-right py-3 px-2 font-medium">Остаток</th>
                        <th className="text-center py-3 px-2 font-medium">Ставка</th>
                        <th className="text-center py-3 px-2 font-medium">Срок</th>
                        <th className="text-center py-3 px-2 font-medium">Статус</th>
                        <th className="text-left py-3 px-2 font-medium">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((l) => (
                        <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-2">{l.loan_type}</td>
                          <td className="py-3 px-2 text-right">{Number(l.amount).toLocaleString()} ₸</td>
                          <td className="py-3 px-2 text-right">{Number(l.remaining_amount).toLocaleString()} ₸</td>
                          <td className="py-3 px-2 text-center">{l.interest_rate}%</td>
                          <td className="py-3 px-2 text-center">{l.term_months} мес</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "approved" || l.status === "active" ? "bg-green-500/10 text-green-400" : l.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{l.user_id?.slice(0, 8)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Deposits tab */}
            <TabsContent value="deposits">
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Все депозиты</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2 font-medium">План</th>
                        <th className="text-right py-3 px-2 font-medium">Сумма</th>
                        <th className="text-center py-3 px-2 font-medium">Ставка</th>
                        <th className="text-center py-3 px-2 font-medium">Срок</th>
                        <th className="text-center py-3 px-2 font-medium">Статус</th>
                        <th className="text-left py-3 px-2 font-medium">Открыт</th>
                        <th className="text-left py-3 px-2 font-medium">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map((d) => (
                        <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-2">{d.plan_name}</td>
                          <td className="py-3 px-2 text-right">{Number(d.amount).toLocaleString()} ₸</td>
                          <td className="py-3 px-2 text-center">{d.interest_rate}%</td>
                          <td className="py-3 px-2 text-center">{d.term_months} мес</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">{new Date(d.opened_at).toLocaleDateString("ru")}</td>
                          <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{d.user_id?.slice(0, 8)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Cards tab */}
            <TabsContent value="cards">
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Все карты</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2 font-medium">Номер</th>
                        <th className="text-left py-3 px-2 font-medium">Держатель</th>
                        <th className="text-center py-3 px-2 font-medium">Тип</th>
                        <th className="text-center py-3 px-2 font-medium">Статус</th>
                        <th className="text-left py-3 px-2 font-medium">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((c) => (
                        <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-2 font-mono">{c.card_number}</td>
                          <td className="py-3 px-2">{c.card_holder}</td>
                          <td className="py-3 px-2 text-center">{c.is_virtual ? "Virtual" : c.card_type}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{c.user_id?.slice(0, 8)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
