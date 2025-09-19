import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Banknote,
  Clock,
  Plus,
  Minus,
  Calculator,
  Receipt,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/datetime';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Shift {
  id: string;
  staff_user_id: string;
  staff_name: string;
  opening_balance: number;
  closing_balance?: number;
  status: 'open' | 'closed';
  created_at: Date;
  closed_at?: Date;
  notes?: string;
}

interface CashTransaction {
  id: string;
  shift_id: string;
  type: 'sale' | 'refund' | 'payout' | 'deposit' | 'opening' | 'closing';
  amount: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  receipt_number?: string;
  created_at: Date;
  user_id: string;
  notes?: string;
}

interface ShiftSummary {
  total_sales: number;
  total_refunds: number;
  total_payouts: number;
  total_deposits: number;
  net_cash_flow: number;
  transaction_count: number;
  expected_closing_balance: number;
}

export const CashRegisterManager = () => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [isOpenShiftDialogOpen, setIsOpenShiftDialogOpen] = useState(false);
  const [isCloseShiftDialogOpen, setIsCloseShiftDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<string>('');
  const [closingBalance, setClosingBalance] = useState<string>('');
  const [newTransaction, setNewTransaction] = useState({
    type: 'sale' as CashTransaction['type'],
    amount: '',
    description: '',
    notes: ''
  });
  const { toast } = useToast();

  // Mock data
  const mockShift: Shift = {
    id: 'shift_1',
    staff_user_id: 'staff_1',
    staff_name: 'Marie Novotná',
    opening_balance: 5000,
    status: 'open',
    created_at: new Date('2024-01-15T08:00:00'),
    notes: 'Ranní směna'
  };

  const mockTransactions: CashTransaction[] = [
    {
      id: 'trans_1',
      shift_id: 'shift_1',
      type: 'opening',
      amount: 5000,
      description: 'Otevření směny',
      created_at: new Date('2024-01-15T08:00:00'),
      user_id: 'staff_1',
      receipt_number: 'OP-001'
    },
    {
      id: 'trans_2',
      shift_id: 'shift_1',
      type: 'sale',
      amount: 750,
      description: 'Rezervace Kurt 1',
      reference_type: 'reservation',
      reference_id: 'res_1',
      created_at: new Date('2024-01-15T10:30:00'),
      user_id: 'staff_1',
      receipt_number: 'SA-001'
    },
    {
      id: 'trans_3',
      shift_id: 'shift_1',
      type: 'sale',
      amount: 280,
      description: 'Barový účet - Jan Novák',
      reference_type: 'bar_order',
      reference_id: 'bar_1',
      created_at: new Date('2024-01-15T14:15:00'),
      user_id: 'staff_1',
      receipt_number: 'SA-002'
    }
  ];

  useEffect(() => {
    loadCashData();
  }, []);

  useEffect(() => {
    if (currentShift) {
      calculateShiftSummary();
    }
  }, [currentShift, transactions]);

  const loadCashData = async () => {
    try {
      // TODO: Replace with actual Supabase queries
      setCurrentShift(mockShift);
      setTransactions(mockTransactions);
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst data pokladny.',
        variant: 'destructive'
      });
    }
  };

  const calculateShiftSummary = () => {
    if (!currentShift) return;

    const shiftTransactions = transactions.filter(t => t.shift_id === currentShift.id);
    
    const summary: ShiftSummary = {
      total_sales: shiftTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0),
      total_refunds: shiftTransactions
        .filter(t => t.type === 'refund')
        .reduce((sum, t) => sum + t.amount, 0),
      total_payouts: shiftTransactions
        .filter(t => t.type === 'payout')
        .reduce((sum, t) => sum + t.amount, 0),
      total_deposits: shiftTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      net_cash_flow: 0,
      transaction_count: shiftTransactions.length,
      expected_closing_balance: 0
    };

    summary.net_cash_flow = summary.total_sales + summary.total_deposits - summary.total_refunds - summary.total_payouts;
    summary.expected_closing_balance = currentShift.opening_balance + summary.net_cash_flow;

    setShiftSummary(summary);
  };

  const openShift = async () => {
    if (!openingBalance) return;

    try {
      const newShift: Shift = {
        id: `shift_${Date.now()}`,
        staff_user_id: 'current_staff', // TODO: Get from auth
        staff_name: 'Současný uživatel',
        opening_balance: parseFloat(openingBalance),
        status: 'open',
        created_at: new Date(),
        notes: ''
      };

      // Add opening transaction
      const openingTransaction: CashTransaction = {
        id: `trans_${Date.now()}`,
        shift_id: newShift.id,
        type: 'opening',
        amount: parseFloat(openingBalance),
        description: 'Otevření směny',
        created_at: new Date(),
        user_id: 'current_staff',
        receipt_number: `OP-${Date.now().toString().slice(-6)}`
      };

      setCurrentShift(newShift);
      setTransactions(prev => [...prev, openingTransaction]);
      setIsOpenShiftDialogOpen(false);
      setOpeningBalance('');

      toast({
        title: 'Směna otevřena',
        description: `Směna byla otevřena s počátečním stavem ${formatCurrency(parseFloat(openingBalance))}.`,
      });
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se otevřít směnu.',
        variant: 'destructive'
      });
    }
  };

  const closeShift = async () => {
    if (!currentShift || !closingBalance) return;

    try {
      const closingTransaction: CashTransaction = {
        id: `trans_${Date.now()}`,
        shift_id: currentShift.id,
        type: 'closing',
        amount: parseFloat(closingBalance),
        description: 'Uzavření směny',
        created_at: new Date(),
        user_id: 'current_staff',
        receipt_number: `CL-${Date.now().toString().slice(-6)}`
      };

      const updatedShift: Shift = {
        ...currentShift,
        closing_balance: parseFloat(closingBalance),
        status: 'closed',
        closed_at: new Date()
      };

      setCurrentShift(null);
      setTransactions(prev => [...prev, closingTransaction]);
      setShifts(prev => [...prev, updatedShift]);
      setIsCloseShiftDialogOpen(false);
      setClosingBalance('');

      toast({
        title: 'Směna uzavřena',
        description: 'Směna byla úspěšně uzavřena.',
      });
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se uzavřít směnu.',
        variant: 'destructive'
      });
    }
  };

  const addTransaction = async () => {
    if (!currentShift || !newTransaction.amount || !newTransaction.description) return;

    try {
      const transaction: CashTransaction = {
        id: `trans_${Date.now()}`,
        shift_id: currentShift.id,
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description,
        notes: newTransaction.notes || undefined,
        created_at: new Date(),
        user_id: 'current_staff',
        receipt_number: `${newTransaction.type.toUpperCase().slice(0, 2)}-${Date.now().toString().slice(-6)}`
      };

      setTransactions(prev => [...prev, transaction]);
      setNewTransaction({ type: 'sale', amount: '', description: '', notes: '' });
      setIsTransactionDialogOpen(false);

      toast({
        title: 'Transakce přidána',
        description: 'Transakce byla úspěšně přidána.',
      });
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se přidat transakci.',
        variant: 'destructive'
      });
    }
  };

  const getTransactionIcon = (type: CashTransaction['type']) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deposit':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'refund':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'payout':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'opening':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'closing':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (type: CashTransaction['type']) => {
    switch (type) {
      case 'sale': return 'Prodej';
      case 'refund': return 'Refund';
      case 'payout': return 'Výplata';
      case 'deposit': return 'Vklad';
      case 'opening': return 'Otevření';
      case 'closing': return 'Uzavření';
      default: return type;
    }
  };

  const shiftTransactions = transactions.filter(t => t.shift_id === currentShift?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pokladna</h2>
        <div className="flex gap-2">
          {!currentShift ? (
            <Dialog open={isOpenShiftDialogOpen} onOpenChange={setIsOpenShiftDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-tennis">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Otevřít směnu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Otevření směny</DialogTitle>
                  <DialogDescription>
                    Zadejte počáteční stav pokladny
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="openingBalance">Počáteční stav (Kč)</Label>
                    <Input
                      id="openingBalance"
                      type="number"
                      step="0.01"
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(e.target.value)}
                      placeholder="5000.00"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={openShift} className="flex-1" disabled={!openingBalance}>
                      Otevřít směnu
                    </Button>
                    <Button variant="outline" onClick={() => setIsOpenShiftDialogOpen(false)} className="flex-1">
                      Zrušit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Nová transakce
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nová transakce</DialogTitle>
                    <DialogDescription>
                      Přidejte novou hotovostní transakci
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Typ transakce</Label>
                      <Select
                        value={newTransaction.type}
                        onValueChange={(value) => setNewTransaction(prev => ({ ...prev, type: value as CashTransaction['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">Prodej</SelectItem>
                          <SelectItem value="deposit">Vklad</SelectItem>
                          <SelectItem value="refund">Refund</SelectItem>
                          <SelectItem value="payout">Výplata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Částka (Kč)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Popis</Label>
                      <Input
                        id="description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Popis transakce"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Poznámky (volitelné)</Label>
                      <Textarea
                        id="notes"
                        value={newTransaction.notes}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Dodatečné poznámky"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addTransaction} className="flex-1" disabled={!newTransaction.amount || !newTransaction.description}>
                        Přidat transakci
                      </Button>
                      <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)} className="flex-1">
                        Zrušit
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <AlertDialog open={isCloseShiftDialogOpen} onOpenChange={setIsCloseShiftDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Uzavřít směnu
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Uzavření směny</AlertDialogTitle>
                    <AlertDialogDescription>
                      Zadejte skutečný stav hotovosti v pokladně na konci směny.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="closingBalance">Koncový stav (Kč)</Label>
                      <Input
                        id="closingBalance"
                        type="number"
                        step="0.01"
                        value={closingBalance}
                        onChange={(e) => setClosingBalance(e.target.value)}
                        placeholder={shiftSummary?.expected_closing_balance.toFixed(2) || '0.00'}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Očekávaný stav: {formatCurrency(shiftSummary?.expected_closing_balance || 0)}
                      </p>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Zrušit</AlertDialogCancel>
                    <AlertDialogAction onClick={closeShift} disabled={!closingBalance}>
                      Uzavřít směnu
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {!currentShift ? (
        <Card>
          <CardContent className="text-center py-12">
            <Banknote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádná otevřená směna</h3>
            <p className="text-muted-foreground mb-4">
              Pro práci s pokladnou je třeba nejprve otevřít směnu
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Shift Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Aktuální směna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Pracovník</Label>
                  <p className="font-medium">{currentShift.staff_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Začátek</Label>
                  <p className="font-medium">{formatDateTime(currentShift.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Počáteční stav</Label>
                  <p className="font-medium">{formatCurrency(currentShift.opening_balance)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Očekávaný stav</Label>
                  <p className="font-medium text-primary">
                    {formatCurrency(shiftSummary?.expected_closing_balance || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shift Summary */}
          {shiftSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Přehled směny
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tržby:</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(shiftSummary.total_sales)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Refundy:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(shiftSummary.total_refunds)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Výplaty:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(shiftSummary.total_payouts)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Vklady:</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(shiftSummary.total_deposits)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>Čistý tok:</span>
                    <span className={shiftSummary.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {shiftSummary.net_cash_flow >= 0 ? '+' : ''}{formatCurrency(shiftSummary.net_cash_flow)}
                    </span>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <Badge variant="secondary">
                    Transakce: {shiftSummary.transaction_count}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Transactions List */}
      {currentShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Transakce směny ({shiftTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {shiftTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {getTransactionLabel(transaction.type)} • {formatDateTime(transaction.created_at)}
                        {transaction.receipt_number && ` • ${transaction.receipt_number}`}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    ['sale', 'deposit', 'opening'].includes(transaction.type) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {['sale', 'deposit', 'opening'].includes(transaction.type) ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
              {shiftTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Žádné transakce v této směně
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};