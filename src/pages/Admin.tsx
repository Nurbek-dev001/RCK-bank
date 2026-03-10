import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, Users, ArrowLeftRight, Wallet, PiggyBank, TrendingUp, LogOut, Search, Ban, CheckCircle, CreditCard, BarChart3, Shield, Eye, Clock, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, txToday: 0, activeLoans: 0, totalDeposits: 0, pendingApprovals: 0 });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
    const [profilesRes, txRes, loansRes, depositsRes, cardsRes, accountsRes, pendingRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("loans").select("*").order("created_at", { ascending: false }),
      supabase.from("deposits").select("*").order("created_at", { ascending: false }),
      supabase.from("cards").select("*").order("created_at", { ascending: false }),
      supabase.from("accounts").select("*"),
      supabase.from("transactions").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    ]);

    setProfiles(profilesRes.data || []);
    setTransactions(txRes.data || []);
    setLoans(loansRes.data || []);
    setDeposits(depositsRes.data || []);
    setCards(cardsRes.data || []);
    setAccounts(accountsRes.data || []);
    setPendingTransfers(pendingRes.data || []);

    const today = new Date().toISOString().split("T")[0];
    setStats({
      users: (profilesRes.data || []).length,
      txToday: (txRes.data || []).filter(t => t.created_at.startsWith(today)).length,
      activeLoans: (loansRes.data || []).filter(l => l.status === "approved" || l.status === "active").length,
      totalDeposits: (depositsRes.data || []).filter(d => d.status === "active").reduce((s, d) => s + Number(d.amount), 0),
      pendingApprovals: (pendingRes.data || []).length,
    });
  };

  const handleApprove = async (txId: string) => {
    const { error } = await supabase.from("transactions").update({ status: "approved" as any }).eq("id", txId);
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Одобрено", description: "Перевод одобрен" });
    fetchAll();
  };

  const handleReject = async (txId: string) => {
    const { error } = await supabase.from("transactions").update({ status: "rejected" as any }).eq("id", txId);
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Отклонено", description: "Перевод отклонён" });
    fetchAll();
  };

  const openUserDetail = (profile: any) => {
    setSelectedUser(profile);
    setUserDetailOpen(true);
  };

  const getUserAccounts = (userId: string) => accounts.filter(a => a.user_id === userId);
  const getUserCards = (userId: string) => cards.filter(c => c.user_id === userId);
  const getUserLoans = (userId: string) => loans.filter(l => l.user_id === userId);
  const getUserDeposits = (userId: string) => deposits.filter(d => d.user_id === userId);
  const getUserTransactions = (userId: string) => transactions.filter(t => t.user_id === userId);
  const getUserName = (userId: string) => profiles.find(p => p.user_id === userId)?.full_name || userId.slice(0, 8);

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
    { label: "Ожидают одобрения", value: String(stats.pendingApprovals), icon: Clock, color: "text-yellow-400" },
  ];

  const sidebarItems = [
    { title: "Обзор", icon: TrendingUp, tab: "overview" },
    { title: "Пользователи", icon: Users, tab: "users" },
    { title: "Одобрение переводов", icon: Shield, tab: "approvals" },
    { title: "Транзакции", icon: ArrowLeftRight, tab: "transactions" },
    { title: "Кредиты", icon: Wallet, tab: "loans" },
    { title: "Депозиты", icon: PiggyBank, tab: "deposits" },
    { title: "Карты", icon: CreditCard, tab: "cards" },
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
          {sidebarItems.map((item) => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === item.tab ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
              <item.icon className="w-4 h-4" />
              {item.title}
              {item.tab === "approvals" && stats.pendingApprovals > 0 && (
                <span className="ml-auto bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full">{stats.pendingApprovals}</span>
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {stats.pendingApprovals > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium">{stats.pendingApprovals} крупных переводов ожидают одобрения</span>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => setActiveTab("approvals")}>Перейти</Button>
                </div>
              )}
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Последние регистрации</h2>
                <div className="space-y-3">
                  {profiles.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{p.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("ru")}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => openUserDetail(p)}><Eye className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users tab */}
          {activeTab === "users" && (
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
                      <th className="text-left py-3 px-2 font-medium">Телефон</th>
                      <th className="text-center py-3 px-2 font-medium">Скоринг</th>
                      <th className="text-right py-3 px-2 font-medium">Баланс</th>
                      <th className="text-center py-3 px-2 font-medium">Карты</th>
                      <th className="text-center py-3 px-2 font-medium">Кредиты</th>
                      <th className="text-center py-3 px-2 font-medium">Депозиты</th>
                      <th className="text-left py-3 px-2 font-medium">Дата рег.</th>
                      <th className="text-center py-3 px-2 font-medium">Детали</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map((p) => {
                      const userAccounts = getUserAccounts(p.user_id);
                      const totalBalance = userAccounts.reduce((s: number, a: any) => s + Number(a.balance), 0);
                      const userCards = getUserCards(p.user_id);
                      const userLoans = getUserLoans(p.user_id);
                      const userDeposits = getUserDeposits(p.user_id);
                      return (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-2 font-medium">{p.full_name || "—"}</td>
                          <td className="py-3 px-2 text-muted-foreground">{p.phone || "—"}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${(p.credit_score || 0) >= 700 ? "bg-green-500/10 text-green-400" : (p.credit_score || 0) >= 500 ? "bg-yellow-500/10 text-yellow-400" : "bg-destructive/10 text-destructive"}`}>
                              {p.credit_score}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-medium">{totalBalance.toLocaleString()} ₸</td>
                          <td className="py-3 px-2 text-center">{userCards.length}</td>
                          <td className="py-3 px-2 text-center">{userLoans.filter((l: any) => l.status === "active" || l.status === "approved").length}</td>
                          <td className="py-3 px-2 text-center">{userDeposits.filter((d: any) => d.status === "active").length}</td>
                          <td className="py-3 px-2 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("ru")}</td>
                          <td className="py-3 px-2 text-center">
                            <Button size="sm" variant="ghost" onClick={() => openUserDetail(p)}><Eye className="w-4 h-4" /></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approvals tab */}
          {activeTab === "approvals" && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Крупные переводы на одобрение</h2>
              {pendingTransfers.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">Нет переводов, ожидающих одобрения</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2 font-medium">Дата</th>
                        <th className="text-left py-3 px-2 font-medium">Пользователь</th>
                        <th className="text-left py-3 px-2 font-medium">Описание</th>
                        <th className="text-left py-3 px-2 font-medium">Получатель</th>
                        <th className="text-right py-3 px-2 font-medium">Сумма</th>
                        <th className="text-center py-3 px-2 font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTransfers.map((t) => (
                        <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-2 text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString("ru")}</td>
                          <td className="py-3 px-2 font-medium">{getUserName(t.user_id)}</td>
                          <td className="py-3 px-2">{t.description || "—"}</td>
                          <td className="py-3 px-2">{t.recipient_name || "—"}</td>
                          <td className="py-3 px-2 text-right font-bold text-yellow-400">{Number(t.amount).toLocaleString()} ₸</td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="outline" className="text-green-400 border-green-500/30 hover:bg-green-500/10" onClick={() => handleApprove(t.id)}>
                                <Check className="w-4 h-4 mr-1" /> Одобрить
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(t.id)}>
                                <X className="w-4 h-4 mr-1" /> Отклонить
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Transactions tab */}
          {activeTab === "transactions" && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Все транзакции</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-2 font-medium">Дата</th>
                      <th className="text-left py-3 px-2 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-2 font-medium">Категория</th>
                      <th className="text-left py-3 px-2 font-medium">Описание</th>
                      <th className="text-right py-3 px-2 font-medium">Сумма</th>
                      <th className="text-center py-3 px-2 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-3 px-2 text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString("ru")}</td>
                        <td className="py-3 px-2 font-medium">{getUserName(t.user_id)}</td>
                        <td className="py-3 px-2">{t.category}</td>
                        <td className="py-3 px-2">{t.description || "—"}</td>
                        <td className={`py-3 px-2 text-right font-medium ${t.is_income ? "text-green-400" : "text-destructive"}`}>
                          {t.is_income ? "+" : "-"}{Number(t.amount).toLocaleString()} ₸
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "approved" ? "bg-green-500/10 text-green-400" : t.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-destructive/10 text-destructive"}`}>
                            {t.status === "approved" ? "Одобрен" : t.status === "pending" ? "Ожидает" : "Отклонён"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loans tab */}
          {activeTab === "loans" && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Все кредиты</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-2 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-2 font-medium">Тип</th>
                      <th className="text-right py-3 px-2 font-medium">Сумма</th>
                      <th className="text-right py-3 px-2 font-medium">Остаток</th>
                      <th className="text-center py-3 px-2 font-medium">Ставка</th>
                      <th className="text-center py-3 px-2 font-medium">Срок</th>
                      <th className="text-center py-3 px-2 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((l) => (
                      <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-3 px-2 font-medium">{getUserName(l.user_id)}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deposits tab */}
          {activeTab === "deposits" && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Все депозиты</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-2 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-2 font-medium">План</th>
                      <th className="text-right py-3 px-2 font-medium">Сумма</th>
                      <th className="text-center py-3 px-2 font-medium">Ставка</th>
                      <th className="text-center py-3 px-2 font-medium">Срок</th>
                      <th className="text-center py-3 px-2 font-medium">Статус</th>
                      <th className="text-left py-3 px-2 font-medium">Открыт</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((d) => (
                      <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-3 px-2 font-medium">{getUserName(d.user_id)}</td>
                        <td className="py-3 px-2">{d.plan_name}</td>
                        <td className="py-3 px-2 text-right">{Number(d.amount).toLocaleString()} ₸</td>
                        <td className="py-3 px-2 text-center">{d.interest_rate}%</td>
                        <td className="py-3 px-2 text-center">{d.term_months} мес</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground text-xs">{new Date(d.opened_at).toLocaleDateString("ru")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards tab */}
          {activeTab === "cards" && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Все карты</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-2 font-medium">Пользователь</th>
                      <th className="text-left py-3 px-2 font-medium">Номер</th>
                      <th className="text-left py-3 px-2 font-medium">Держатель</th>
                      <th className="text-center py-3 px-2 font-medium">Тип</th>
                      <th className="text-center py-3 px-2 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((c) => (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-3 px-2 font-medium">{getUserName(c.user_id)}</td>
                        <td className="py-3 px-2 font-mono">{c.card_number}</td>
                        <td className="py-3 px-2">{c.card_holder}</td>
                        <td className="py-3 px-2 text-center">{c.is_virtual ? "Virtual" : c.card_type}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Детали пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Имя</p>
                  <p className="font-medium">{selectedUser.full_name || "—"}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Телефон</p>
                  <p className="font-medium">{selectedUser.phone || "—"}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Кредитный скоринг</p>
                  <p className="font-medium">{selectedUser.credit_score}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Дата регистрации</p>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString("ru")}</p>
                </div>
              </div>

              {/* Accounts */}
              <div>
                <h3 className="font-display font-semibold mb-2">Счета</h3>
                {getUserAccounts(selectedUser.user_id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет счетов</p>
                ) : (
                  <div className="space-y-2">
                    {getUserAccounts(selectedUser.user_id).map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                        <span className="text-sm">{a.name}</span>
                        <span className="font-bold">{Number(a.balance).toLocaleString()} ₸</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cards */}
              <div>
                <h3 className="font-display font-semibold mb-2">Карты ({getUserCards(selectedUser.user_id).length})</h3>
                <div className="space-y-2">
                  {getUserCards(selectedUser.user_id).map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-mono">{c.card_number}</p>
                        <p className="text-xs text-muted-foreground">{c.is_virtual ? "Виртуальная" : c.card_type}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loans */}
              <div>
                <h3 className="font-display font-semibold mb-2">Кредиты ({getUserLoans(selectedUser.user_id).length})</h3>
                <div className="space-y-2">
                  {getUserLoans(selectedUser.user_id).map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                      <div>
                        <p className="text-sm">{l.loan_type} — {Number(l.amount).toLocaleString()} ₸</p>
                        <p className="text-xs text-muted-foreground">Остаток: {Number(l.remaining_amount).toLocaleString()} ₸</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "active" || l.status === "approved" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposits */}
              <div>
                <h3 className="font-display font-semibold mb-2">Депозиты ({getUserDeposits(selectedUser.user_id).length})</h3>
                <div className="space-y-2">
                  {getUserDeposits(selectedUser.user_id).map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                      <div>
                        <p className="text-sm">{d.plan_name} — {Number(d.amount).toLocaleString()} ₸</p>
                        <p className="text-xs text-muted-foreground">{d.interest_rate}% на {d.term_months} мес</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="font-display font-semibold mb-2">Последние транзакции</h3>
                <div className="space-y-2">
                  {getUserTransactions(selectedUser.user_id).slice(0, 10).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                      <div>
                        <p className="text-sm">{t.description || t.category}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("ru")}</p>
                      </div>
                      <span className={`font-medium text-sm ${t.is_income ? "text-green-400" : "text-destructive"}`}>
                        {t.is_income ? "+" : "-"}{Number(t.amount).toLocaleString()} ₸
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
