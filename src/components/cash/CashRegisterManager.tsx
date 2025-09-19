/**
 * Cash Register Manager Component
 * Manages cash register operations, shifts, and transactions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Banknote, 
  Lock, 
  Unlock, 
  Plus, 
  Minus, 
  Receipt, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cashRegisterService, type CashSummary, type Shift } from '@/services/cashRegisterService';
import { formatCurrency, parseCurrency } from '@/lib/utils/currency';
import { useToast } from '@/hooks/use-toast';

export const CashRegisterManager = () => {
  const [cashSummary, setCashSummary] = useState<CashSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  
  // Form states
  const [openingBalance, setOpeningBalance] = useState('0');
  const [closingBalance, setClosingBalance] = useState('0');
  const [transactionAmount, setTransactionAmount] = useState('0');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadCashSummary();
  }, []);

  const loadCashSummary = async () => {
    setIsLoading(true);
    try {
      const summary = await cashRegisterService.getCashSummary();
      setCashSummary(summary);
      
      // Set closing balance to current balance as starting point
      if (summary.openShift) {
        setClosingBalance(summary.currentBalance.toString());
      }
    } catch (error) {
      console.error('Error loading cash summary:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst stav pokladny",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenShift = async () => {
    try {
      const balance = parseCurrency(openingBalance);
      await cashRegisterService.openShift(balance, notes);
      
      toast({
        title: "Směna otevřena",
        description: `Počáteční stav: ${formatCurrency(balance)}`
      });
      
      setShowOpenDialog(false);
      setOpeningBalance('0');
      setNotes('');
      await loadCashSummary();
    } catch (error) {
      console.error('Error opening shift:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se otevřít směnu",
        variant: "destructive"
      });
    }
  };

  const handleCloseShift = async () => {
    try {
      const balance = parseCurrency(closingBalance);
      await cashRegisterService.closeShift(balance, notes);
      
      toast({
        title: "Směna uzavřena",
        description: `Konečný stav: ${formatCurrency(balance)}`
      });
      
      setShowCloseDialog(false);
      setClosingBalance('0');
      setNotes('');
      await loadCashSummary();
    } catch (error) {
      console.error('Error closing shift:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se uzavřít směnu",
        variant: "destructive"
      });
    }
  };

  const handleTransaction = async () => {
    try {
      const amount = parseCurrency(transactionAmount);
      
      if (amount <= 0) {
        toast({
          title: "Chyba",
          description: "Částka musí být větší než 0",
          variant: "destructive"
        });
        return;
      }

      await cashRegisterService.addLedgerEntry({
        transaction_type: transactionType === 'in' ? 'cash_in' : 'cash_out',
        amount,
        description: transactionDescription,
        notes
      });

      toast({
        title: "Transakce zaznamenána",
        description: `${transactionType === 'in' ? 'Příjem' : 'Výdej'}: ${formatCurrency(amount)}`
      });

      setShowTransactionDialog(false);
      setTransactionAmount('0');
      setTransactionDescription('');
      setNotes('');
      await loadCashSummary();
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se zaznamenat transakci",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Načítám stav pokladny...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasOpenShift = cashSummary?.openShift;

  return (
    <div className="space-y-6">
      {/* Cash Register Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Pokladna
            </CardTitle>
            <Badge variant={hasOpenShift ? "default" : "secondary"}>
              {hasOpenShift ? (
                <>
                  <Unlock className="h-3 w-3 mr-1" />
                  Otevřena
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Uzavřena
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Balance */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Aktuální stav</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(cashSummary?.currentBalance || 0)}
            </p>
          </div>

          <Separator />

          {/* Today's Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Příjmy</span>
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(cashSummary?.todayIncome || 0)}
              </p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">Výdaje</span>
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(cashSummary?.todayExpenses || 0)}
              </p>
            </div>
          </div>

          {/* Shift Info */}
          {hasOpenShift && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Směna otevřena: {new Date(cashSummary.openShift.created_at).toLocaleString('cs-CZ')}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Počáteční stav: </span>
                  <span className="font-medium">
                    {formatCurrency(cashSummary.openShift.opening_balance)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!hasOpenShift ? (
          <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Unlock className="h-4 w-4 mr-2" />
                Otevřít směnu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Otevřít směnu</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="opening-balance">Počáteční stav pokladny</Label>
                  <Input
                    id="opening-balance"
                    type="number"
                    step="0.01"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="opening-notes">Poznámky</Label>
                  <Textarea
                    id="opening-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Volitelné poznámky k otevření směny"
                  />
                </div>
                <Button onClick={handleOpenShift} className="w-full">
                  Otevřít směnu
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <>
            <Button variant="outline" onClick={() => {setTransactionType('in'); setShowTransactionDialog(true);}}>
              <Plus className="h-4 w-4 mr-2" />
              Příjem
            </Button>

            <Button variant="outline" onClick={() => {setTransactionType('out'); setShowTransactionDialog(true);}}>
              <Minus className="h-4 w-4 mr-2" />
              Výdej
            </Button>

            <Button variant="destructive" onClick={() => setShowCloseDialog(true)}>
              <Lock className="h-4 w-4 mr-2" />
              Uzavřít směnu
            </Button>
          </>
        )}
      </div>

      {/* Close Shift Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uzavřít směnu</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Opravdu chcete uzavřít aktuální směnu?</p>
                <div>
                  <Label htmlFor="closing-balance">Skutečný stav pokladny</Label>
                  <Input
                    id="closing-balance"
                    type="number"
                    step="0.01"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="closing-notes">Poznámky k uzavření</Label>
                  <Textarea
                    id="closing-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Volitelné poznámky k uzavření směny"
                    className="mt-1"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseShift}>
              Uzavřít směnu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionType === 'in' ? 'Příjem do pokladny' : 'Výdej z pokladny'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transaction-amount">Částka</Label>
              <Input
                id="transaction-amount"
                type="number"
                step="0.01"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="transaction-description">Popis</Label>
              <Input
                id="transaction-description"
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
                placeholder="Důvod transakce"
                required
              />
            </div>
            <div>
              <Label htmlFor="transaction-notes">Poznámky</Label>
              <Textarea
                id="transaction-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Volitelné poznámky"
              />
            </div>
            <Button onClick={handleTransaction} className="w-full">
              {transactionType === 'in' ? 'Zaznamenat příjem' : 'Zaznamenat výdej'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};