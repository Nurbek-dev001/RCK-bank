import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Plus, Ban, RefreshCw, Settings, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

type Card = Tables<"cards">;

const Cards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [newCardType, setNewCardType] = useState<"debit" | "virtual">("debit");
  const [newCardHolder, setNewCardHolder] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [limitsDialogOpen, setLimitsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  useEffect(() => { fetchCards(); }, [user]);

  const fetchCards = async () => {
    if (!user) return;
    const { data } = await supabase.from("cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCards(data || []);
    setLoading(false);
  };

  const generateCardNumber = () => {
    const segments = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000));
    return segments.join(" ");
  };

  const issueCard = async () => {
    if (!user || !newCardHolder.trim()) return;
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 3);
    const { error } = await supabase.from("cards").insert({
      user_id: user.id,
      card_type: newCardType,
      card_number: generateCardNumber(),
      card_holder: newCardHolder.toUpperCase(),
      expiry_date: `${String(expiry.getMonth() + 1).padStart(2, "0")}/${String(expiry.getFullYear()).slice(-2)}`,
      is_virtual: newCardType === "virtual",
    });
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Карта выпущена!" });
    setDialogOpen(false);
    setNewCardHolder("");
    fetchCards();
  };

  const toggleBlock = async (card: Card) => {
    const newStatus = card.status === "active" ? "blocked" : "active";
    await supabase.from("cards").update({ status: newStatus }).eq("id", card.id);
    toast({ title: newStatus === "blocked" ? "Карта заблокирована" : "Карта разблокирована" });
    fetchCards();
  };

  const reissueCard = async (card: Card) => {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 3);
    await supabase.from("cards").update({
      card_number: generateCardNumber(),
      expiry_date: `${String(expiry.getMonth() + 1).padStart(2, "0")}/${String(expiry.getFullYear()).slice(-2)}`,
      status: "active",
    }).eq("id", card.id);
    toast({ title: "Карта перевыпущена!" });
    fetchCards();
  };

  const updateLimits = async () => {
    if (!selectedCard) return;
    await supabase.from("cards").update({
      daily_limit: Number(dailyLimit) || selectedCard.daily_limit,
      monthly_limit: Number(monthlyLimit) || selectedCard.monthly_limit,
    }).eq("id", selectedCard.id);
    toast({ title: "Лимиты обновлены!" });
    setLimitsDialogOpen(false);
    fetchCards();
  };

  const maskNumber = (num: string) => num.replace(/(\d{4})\s(\d{4})\s(\d{4})\s(\d{4})/, "$1 •••• •••• $4");

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400",
    blocked: "bg-destructive/10 text-destructive",
    expired: "bg-muted text-muted-foreground",
    pending: "bg-primary/10 text-primary",
  };

  const statusLabels: Record<string, string> = {
    active: "Активна", blocked: "Заблокирована", expired: "Истекла", pending: "Ожидание",
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Мои карты</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold"><Plus className="w-4 h-4 mr-2" /> Выпустить карту</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display">Выпуск новой карты</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Тип карты</Label>
                  <Select value={newCardType} onValueChange={(v) => setNewCardType(v as any)}>
                    <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Дебетовая</SelectItem>
                      <SelectItem value="virtual">Виртуальная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Имя держателя (латиницей)</Label>
                  <Input placeholder="IVAN IVANOV" value={newCardHolder} onChange={(e) => setNewCardHolder(e.target.value)} className="bg-secondary/50 border-border" />
                </div>
                <Button variant="gold" className="w-full" onClick={issueCard}>Выпустить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Загрузка...</div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>У вас нет карт. Выпустите первую карту!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="relative overflow-hidden rounded-2xl p-6 bg-gradient-card border border-border">
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[card.status]}`}>{statusLabels[card.status]}</span>
                  <span className="text-xs text-muted-foreground">{card.is_virtual ? "Виртуальная" : card.card_type === "credit" ? "Кредитная" : "Дебетовая"}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <p className="font-mono text-lg tracking-wider">
                    {showNumbers[card.id] ? card.card_number : maskNumber(card.card_number)}
                  </p>
                  <button onClick={() => setShowNumbers(p => ({ ...p, [card.id]: !p[card.id] }))} className="text-muted-foreground hover:text-foreground">
                    {showNumbers[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">{card.card_holder}</span>
                  <span className="text-muted-foreground">{card.expiry_date}</span>
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                  Лимиты: {(card.daily_limit ?? 0).toLocaleString()} ₸/день • {(card.monthly_limit ?? 0).toLocaleString()} ₸/мес
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleBlock(card)} className={card.status === "active" ? "text-destructive" : "text-green-400"}>
                    <Ban className="w-3 h-3 mr-1" /> {card.status === "active" ? "Блокировать" : "Разблокировать"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => reissueCard(card)}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Перевыпуск
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedCard(card); setDailyLimit(String(card.daily_limit ?? 500000)); setMonthlyLimit(String(card.monthly_limit ?? 5000000)); setLimitsDialogOpen(true); }}>
                    <Settings className="w-3 h-3 mr-1" /> Лимиты
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={limitsDialogOpen} onOpenChange={setLimitsDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Изменить лимиты</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Дневной лимит (₸)</Label>
                <Input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} className="bg-secondary/50 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Месячный лимит (₸)</Label>
                <Input type="number" value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} className="bg-secondary/50 border-border" />
              </div>
              <Button variant="gold" className="w-full" onClick={updateLimits}>Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default Cards;
