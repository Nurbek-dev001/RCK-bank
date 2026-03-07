import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const loanTypeLabels: Record<string, string> = {
  consumer: "Потребительский кредит", auto: "Автокредит", mortgage: "Ипотека",
};

const loanRates: Record<string, number> = {
  consumer: 18, auto: 14, mortgage: 10,
};

const Loans = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loanType, setLoanType] = useState<"consumer" | "auto" | "mortgage">("consumer");
  const [amount, setAmount] = useState(500000);
  const [months, setMonths] = useState(12);
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const rate = loanRates[loanType] / 100;
  const monthlyPayment = Math.round((amount * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -months)));

  useEffect(() => { fetchLoans(); }, [user]);

  const fetchLoans = async () => {
    if (!user) return;
    const { data } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setLoans(data || []);
    setLoading(false);
  };

  const fetchPayments = async (loanId: string) => {
    setSelectedLoanId(loanId);
    const { data } = await supabase.from("loan_payments").select("*").eq("loan_id", loanId).order("payment_number");
    setPayments(data || []);
  };

  const handleApply = async () => {
    if (!user) return;
    // Auto-approval based on credit score
    const score = profile?.credit_score ?? 650;
    const autoApproved = score >= 600;
    const status = autoApproved ? "approved" : "rejected";

    const { data: loan, error } = await supabase.from("loans").insert({
      user_id: user.id, loan_type: loanType, amount, remaining_amount: amount,
      interest_rate: loanRates[loanType], term_months: months, monthly_payment: monthlyPayment,
      status, approved_at: autoApproved ? new Date().toISOString() : null,
    }).select().single();

    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }

    // Generate payment schedule if approved
    if (autoApproved && loan) {
      const scheduleRows = Array.from({ length: months }, (_, i) => {
        const interestPart = Math.round((amount * (rate / 12)));
        const principalPart = monthlyPayment - interestPart;
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        return {
          loan_id: loan.id, user_id: user.id, payment_number: i + 1,
          amount: monthlyPayment, principal: principalPart, interest: interestPart,
          due_date: dueDate.toISOString().split("T")[0],
        };
      });
      await supabase.from("loan_payments").insert(scheduleRows);
    }

    toast({
      title: autoApproved ? "Кредит одобрен! ✅" : "Заявка отклонена ❌",
      description: autoApproved ? `${loanTypeLabels[loanType]}: ${amount.toLocaleString()} ₸` : `Кредитный скоринг (${score}) недостаточен`,
      variant: autoApproved ? "default" : "destructive",
    });
    fetchLoans();
  };

  const payLoan = async (paymentId: string, loanId: string) => {
    await supabase.from("loan_payments").update({ is_paid: true, paid_at: new Date().toISOString() }).eq("id", paymentId);
    toast({ title: "Платёж внесён!" });
    fetchPayments(loanId);
  };

  const statusIcons: Record<string, any> = {
    approved: <CheckCircle className="w-4 h-4 text-green-400" />,
    active: <CheckCircle className="w-4 h-4 text-green-400" />,
    pending: <Clock className="w-4 h-4 text-primary" />,
    rejected: <XCircle className="w-4 h-4 text-destructive" />,
    closed: <CheckCircle className="w-4 h-4 text-muted-foreground" />,
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Кредиты</h1>

        {/* Credit score */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ваш кредитный скоринг</p>
              <p className="font-display text-3xl font-bold text-primary">{profile?.credit_score ?? 650}</p>
            </div>
            <div className="w-32 h-2 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${((profile?.credit_score ?? 650) / 850) * 100}%` }} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="apply">
          <TabsList className="bg-secondary/50 mb-6">
            <TabsTrigger value="apply">Подать заявку</TabsTrigger>
            <TabsTrigger value="my">Мои кредиты ({loans.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="apply">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 max-w-lg">
              <div className="space-y-2">
                <Label>Тип кредита</Label>
                <Select value={loanType} onValueChange={(v) => setLoanType(v as any)}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumer">Потребительский кредит (18%)</SelectItem>
                    <SelectItem value="auto">Автокредит (14%)</SelectItem>
                    <SelectItem value="mortgage">Ипотека (10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Сумма: {amount.toLocaleString()} ₸</Label>
                <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={50000} max={loanType === "mortgage" ? 50000000 : 5000000} step={50000} />
              </div>
              <div className="space-y-3">
                <Label>Срок: {months} месяцев</Label>
                <Slider value={[months]} onValueChange={([v]) => setMonths(v)} min={3} max={loanType === "mortgage" ? 360 : 60} step={1} />
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ставка</span><span>{loanRates[loanType]}% годовых</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ежемесячный платёж</span><span className="font-semibold text-primary">{monthlyPayment.toLocaleString()} ₸</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Общая сумма</span><span>{(monthlyPayment * months).toLocaleString()} ₸</span></div>
              </div>
              <Button variant="gold" className="w-full h-11" onClick={handleApply}>Подать заявку</Button>
            </div>
          </TabsContent>

          <TabsContent value="my">
            {loans.length === 0 ? (
              <p className="text-muted-foreground">У вас нет кредитов</p>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {statusIcons[loan.status]}
                        <span className="font-display font-semibold">{loanTypeLabels[loan.loan_type]}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(loan.created_at).toLocaleDateString("ru")}</span>
                    </div>
                    <p className="text-2xl font-display font-bold mb-1">{Number(loan.amount).toLocaleString()} ₸</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Остаток: {Number(loan.remaining_amount).toLocaleString()} ₸ • {loan.term_months} мес • {loan.interest_rate}%
                    </p>
                    {(loan.status === "approved" || loan.status === "active") && (
                      <Button size="sm" variant="outline" onClick={() => fetchPayments(loan.id)}>
                        {selectedLoanId === loan.id ? "Скрыть график" : "График платежей"}
                      </Button>
                    )}
                    {selectedLoanId === loan.id && payments.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        {payments.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
                            <span>#{p.payment_number} — {new Date(p.due_date).toLocaleDateString("ru")}</span>
                            <span>{Number(p.amount).toLocaleString()} ₸</span>
                            {p.is_paid ? (
                              <span className="text-green-400 text-xs">Оплачено</span>
                            ) : (
                              <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => payLoan(p.id, loan.id)}>
                                Оплатить
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default Loans;
