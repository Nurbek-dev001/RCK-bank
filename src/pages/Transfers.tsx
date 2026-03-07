import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle } from "lucide-react";

const Transfers = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast({ title: "Перевод выполнен!", description: `${amount} ₸ отправлено на ${recipient}` });
    setTimeout(() => {
      setSent(false);
      setRecipient("");
      setAmount("");
    }, 3000);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-6">Переводы</h1>

        <div className="max-w-lg">
          <div className="bg-card rounded-xl border border-border p-6">
            {sent ? (
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
                </div>
                <Button type="submit" variant="gold" className="w-full h-11">
                  Отправить <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Transfers;
