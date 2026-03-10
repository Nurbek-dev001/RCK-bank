import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle, ArrowLeftRight, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LARGE_TRANSFER_THRESHOLD = 500000; // 500k ₸ requires admin approval

const Transfers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("transfer");
  const [sent, setSent] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Internal transfer state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [internalAmount, setInternalAmount] = useState("");
  const [internalSent, setInternalSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("accounts").select("*").eq("user_id", user.id).then(({ data }) => {
      setAccounts(data || []);
      if (data && data.length > 0) setFromAccount(data[0].id);
      if (data && data.length > 1) setToAccount(data[1].id);
    });
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numAmount = Number(amount);
    const needsApproval = numAmount >= LARGE_TRANSFER_THRESHOLD;

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount: numAmount,
      category: category as any,
      description: `Перевод на ${recipient}`,
      recipient_name: recipient,
      recipient_account: recipient,
      is_income: false,
      status: (needsApproval ? "pending" : "approved") as any,
    });

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    if (needsApproval) {
      setPendingApproval(true);
      toast({ title: "Перевод на рассмотрении", description: `Крупный перевод на ${numAmount.toLocaleString()} ₸ ожидает одобрения администратора` });
      setTimeout(() => { setPendingApproval(false); setRecipient(""); setAmount(""); }, 4000);
    } else {
      setSent(true);
      toast({ title: "Перевод выполнен!", description: `${amount} ₸ отправлено на ${recipient}` });
      setTimeout(() => { setSent(false); setRecipient(""); setAmount(""); }, 3000);
    }
  };

  const handleInternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || fromAccount === toAccount) {
      toast({ title: "Ошибка", description: "Выберите разные счета", variant: "destructive" });
      return;
    }

    const numAmount = Number(internalAmount);
    const sourceAcc = accounts.find(a => a.id === fromAccount);
    if (!sourceAcc || Number(sourceAcc.balance) < numAmount) {
      toast({ title: "Ошибка", description: "Недостаточно средств на счёте", variant: "destructive" });
      return;
    }

    // Deduct from source, add to destination
    const { error: e1 } = await supabase.from("accounts").update({ balance: Number(sourceAcc.balance) - numAmount }).eq("id", fromAccount);
    const destAcc = accounts.find(a => a.id === toAccount);
    const { error: e2 } = await supabase.from("accounts").update({ balance: Number(destAcc.balance) + numAmount }).eq("id", toAccount);

    if (e1 || e2) {
      toast({ title: "Ошибка", description: (e1 || e2)?.message, variant: "destructive" });
      return;
    }

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      amount: numAmount,
      category: "transfer" as any,
      description: `Перевод между счетами: ${sourceAcc.name} → ${destAcc.name}`,
      is_income: false,
      status: "approved" as any,
    });

    setInternalSent(true);
    toast({ title: "Перевод выполнен!", description: `${numAmount.toLocaleString()} ₸ переведено` });
    // Refresh accounts
    const { data } = await supabase.from("accounts").select("*").eq("user_id", user.id);
    setAccounts(data || []);
    setTimeout(() => { setInternalSent(false); setInternalAmount(""); }, 3000);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Переводы</h1>

        <Tabs defaultValue="external" className="max-w-lg">
          <TabsList className="bg-secondary/50 mb-6">
            <TabsTrigger value="external">Внешний перевод</TabsTrigger>
            <TabsTrigger value="internal">Между своими счетами</TabsTrigger>
          </TabsList>

          <TabsContent value="external">
            <div className="bg-card rounded-xl border border-border p-6">
              {pendingApproval ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                  <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">На рассмотрении</h3>
                  <p className="text-muted-foreground">Крупный перевод ожидает одобрения администратора</p>
                </motion.div>
              ) : sent ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">Перевод успешен!</h3>
                  <p className="text-muted-foreground">{amount} ₸ → {recipient}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleTransfer} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Получатель (номер / email)</Label>
                    <Input placeholder="+7 700 000 0000" value={recipient} onChange={(e) => setRecipient(e.target.value)} required className="bg-secondary/50 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Сумма (₸)</Label>
                    <Input type="number" placeholder="10 000" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required className="bg-secondary/50 border-border" />
                    {Number(amount) >= LARGE_TRANSFER_THRESHOLD && (
                      <p className="text-xs text-yellow-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Крупный перевод — потребуется одобрение администратора</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">Перевод</SelectItem>
                        <SelectItem value="payment">Оплата</SelectItem>
                        <SelectItem value="shopping">Покупки</SelectItem>
                        <SelectItem value="food">Еда</SelectItem>
                        <SelectItem value="transport">Транспорт</SelectItem>
                        <SelectItem value="entertainment">Развлечения</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" variant="gold" className="w-full h-11">
                    Отправить <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>

          <TabsContent value="internal">
            <div className="bg-card rounded-xl border border-border p-6">
              {internalSent ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">Перевод выполнен!</h3>
                </motion.div>
              ) : accounts.length < 2 ? (
                <div className="text-center py-8">
                  <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">Для перевода между счетами нужно минимум 2 счёта</p>
                </div>
              ) : (
                <form onSubmit={handleInternalTransfer} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Со счёта</Label>
                    <Select value={fromAccount} onValueChange={setFromAccount}>
                      <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {accounts.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name} — {Number(a.balance).toLocaleString()} ₸</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>На счёт</Label>
                    <Select value={toAccount} onValueChange={setToAccount}>
                      <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {accounts.filter(a => a.id !== fromAccount).map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name} — {Number(a.balance).toLocaleString()} ₸</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Сумма (₸)</Label>
                    <Input type="number" placeholder="10 000" min={1} value={internalAmount} onChange={(e) => setInternalAmount(e.target.value)} required className="bg-secondary/50 border-border" />
                  </div>
                  <Button type="submit" variant="gold" className="w-full h-11">
                    Перевести <ArrowLeftRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default Transfers;
