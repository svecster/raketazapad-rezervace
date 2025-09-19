import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Minus,
  Trash2,
  Coffee,
  ShoppingCart,
  CreditCard,
  Clock,
  User,
  Receipt,
  Search
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/datetime';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BarItem {
  id: string;
  name: string;
  category: 'drinks' | 'food' | 'other';
  price: number;
  stock: number;
  plu_code?: string;
}

interface BarOrderItem {
  item: BarItem;
  quantity: number;
  price: number;
  notes?: string;
}

interface BarAccount {
  id: string;
  reservation_id?: string;
  court_name?: string;
  customer_name: string;
  items: BarOrderItem[];
  total_price: number;
  payment_status: 'open' | 'closed' | 'checkout';
  created_at: Date;
  closed_at?: Date;
  staff_user_id: string;
  notes?: string;
}

interface BarAccountManagerProps {
  reservationId?: string;
  onSendToCheckout?: (accountId: string, totalAmount: number) => void;
}

export const BarAccountManager = ({ reservationId, onSendToCheckout }: BarAccountManagerProps) => {
  const [barAccounts, setBarAccounts] = useState<BarAccount[]>([]);
  const [barItems, setBarItems] = useState<BarItem[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BarAccount | null>(null);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();

  // Mock bar items
  const mockBarItems: BarItem[] = [
    { id: '1', name: 'Pivo 0.5l', category: 'drinks', price: 80, stock: 50, plu_code: '001' },
    { id: '2', name: 'Kofola 0.33l', category: 'drinks', price: 40, stock: 30, plu_code: '002' },
    { id: '3', name: 'Voda 0.5l', category: 'drinks', price: 30, stock: 25, plu_code: '003' },
    { id: '4', name: 'Topený sýr', category: 'food', price: 120, stock: 15, plu_code: '101' },
    { id: '5', name: 'Kuřecí řízek', category: 'food', price: 180, stock: 10, plu_code: '102' },
    { id: '6', name: 'Hranolky', category: 'food', price: 80, stock: 20, plu_code: '103' },
    { id: '7', name: 'Pronájem rakety', category: 'other', price: 50, stock: 8, plu_code: '201' }
  ];

  // Mock bar accounts
  const mockBarAccounts: BarAccount[] = [
    {
      id: '1',
      reservation_id: 'res_1',
      court_name: 'Kurt 1',
      customer_name: 'Jan Novák',
      items: [
        { item: mockBarItems[0], quantity: 2, price: 160 },
        { item: mockBarItems[3], quantity: 1, price: 120 }
      ],
      total_price: 280,
      payment_status: 'open',
      created_at: new Date('2024-01-15T14:30:00'),
      staff_user_id: 'staff_1',
      notes: 'Bez cibule v topeném sýru'
    },
    {
      id: '2',
      customer_name: 'Marie Svobodová',
      items: [
        { item: mockBarItems[1], quantity: 1, price: 40 },
        { item: mockBarItems[4], quantity: 1, price: 180 }
      ],
      total_price: 220,
      payment_status: 'checkout',
      created_at: new Date('2024-01-15T15:15:00'),
      staff_user_id: 'staff_1'
    }
  ];

  useEffect(() => {
    loadBarData();
  }, []);

  const loadBarData = async () => {
    try {
      // TODO: Replace with actual Supabase queries
      setBarItems(mockBarItems);
      setBarAccounts(mockBarAccounts);
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst data baru.',
        variant: 'destructive'
      });
    }
  };

  const createNewAccount = (customerName: string, reservationId?: string) => {
    const newAccount: BarAccount = {
      id: `account_${Date.now()}`,
      reservation_id: reservationId,
      customer_name: customerName,
      items: [],
      total_price: 0,
      payment_status: 'open',
      created_at: new Date(),
      staff_user_id: 'current_staff' // TODO: Get from auth
    };

    setBarAccounts(prev => [...prev, newAccount]);
    setSelectedAccount(newAccount);
    setIsNewAccountOpen(false);

    toast({
      title: 'Úspěch',
      description: 'Nový barový účet byl vytvořen.',
    });
  };

  const addItemToAccount = (accountId: string, item: BarItem, quantity: number = 1) => {
    setBarAccounts(prev => prev.map(account => {
      if (account.id === accountId) {
        const existingItemIndex = account.items.findIndex(orderItem => orderItem.item.id === item.id);
        let updatedItems;

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems = account.items.map((orderItem, index) => 
            index === existingItemIndex 
              ? { ...orderItem, quantity: orderItem.quantity + quantity, price: (orderItem.quantity + quantity) * item.price }
              : orderItem
          );
        } else {
          // Add new item
          updatedItems = [...account.items, { item, quantity, price: quantity * item.price }];
        }

        const newTotal = updatedItems.reduce((sum, orderItem) => sum + orderItem.price, 0);

        return {
          ...account,
          items: updatedItems,
          total_price: newTotal
        };
      }
      return account;
    }));

    toast({
      title: 'Přidáno',
      description: `${item.name} byl přidán do účtu.`,
    });
  };

  const removeItemFromAccount = (accountId: string, itemId: string) => {
    setBarAccounts(prev => prev.map(account => {
      if (account.id === accountId) {
        const updatedItems = account.items.filter(orderItem => orderItem.item.id !== itemId);
        const newTotal = updatedItems.reduce((sum, orderItem) => sum + orderItem.price, 0);

        return {
          ...account,
          items: updatedItems,
          total_price: newTotal
        };
      }
      return account;
    }));

    toast({
      title: 'Odebráno',
      description: 'Položka byla odebrána z účtu.',
    });
  };

  const updateItemQuantity = (accountId: string, itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromAccount(accountId, itemId);
      return;
    }

    setBarAccounts(prev => prev.map(account => {
      if (account.id === accountId) {
        const updatedItems = account.items.map(orderItem => 
          orderItem.item.id === itemId 
            ? { ...orderItem, quantity: newQuantity, price: newQuantity * orderItem.item.price }
            : orderItem
        );
        const newTotal = updatedItems.reduce((sum, orderItem) => sum + orderItem.price, 0);

        return {
          ...account,
          items: updatedItems,
          total_price: newTotal
        };
      }
      return account;
    }));
  };

  const closeAccount = async (accountId: string) => {
    try {
      setBarAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, payment_status: 'closed', closed_at: new Date() }
          : account
      ));

      toast({
        title: 'Účet uzavřen',
        description: 'Barový účet byl úspěšně uzavřen.',
      });
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se uzavřít účet.',
        variant: 'destructive'
      });
    }
  };

  const sendToCheckout = (accountId: string) => {
    const account = barAccounts.find(acc => acc.id === accountId);
    if (!account) return;

    setBarAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, payment_status: 'checkout' }
        : acc
    ));

    onSendToCheckout?.(accountId, account.total_price);

    toast({
      title: 'Odesláno do checkoutu',
      description: `Účet ${account.customer_name} byl odeslán do checkoutu.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Otevřený</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800">Uzavřený</Badge>;
      case 'checkout':
        return <Badge className="bg-blue-100 text-blue-800">V checkoutu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredItems = barItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plu_code?.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAccounts = barAccounts.filter(account => account.payment_status === 'open');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Barové účty</h2>
        <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
          <DialogTrigger asChild>
            <Button className="btn-tennis">
              <Plus className="mr-2 h-4 w-4" />
              Nový účet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nový barový účet</DialogTitle>
              <DialogDescription>
                Vytvořte nový barový účet pro zákazníka
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Jméno zákazníka</Label>
                <Input 
                  id="customerName" 
                  placeholder="Zadejte jméno zákazníka"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      createNewAccount(e.currentTarget.value.trim());
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    const input = document.getElementById('customerName') as HTMLInputElement;
                    if (input?.value.trim()) {
                      createNewAccount(input.value.trim());
                    }
                  }}
                >
                  Vytvořit účet
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsNewAccountOpen(false)}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Open Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coffee className="mr-2 h-5 w-5" />
              Otevřené účty ({openAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {openAccounts.map(account => (
              <div
                key={account.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedAccount?.id === account.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedAccount(account)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{account.customer_name}</div>
                  {getStatusBadge(account.payment_status)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <div className="flex items-center justify-between">
                    <span>Položek: {account.items.length}</span>
                    <span className="font-medium text-primary">
                      {formatCurrency(account.total_price)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDateTime(account.created_at)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendToCheckout(account.id);
                    }}
                  >
                    <CreditCard className="mr-1 h-3 w-3" />
                    Checkout
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAccount(account.id);
                    }}
                  >
                    <Receipt className="mr-1 h-3 w-3" />
                    Uzavřít
                  </Button>
                </div>
              </div>
            ))}
            {openAccounts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Žádné otevřené účty
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Detail & Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedAccount ? `Účet - ${selectedAccount.customer_name}` : 'Katalog položek'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAccount ? (
              <div className="space-y-4">
                {/* Account Items */}
                <div className="space-y-2">
                  <h4 className="font-medium">Položky na účtě</h4>
                  {selectedAccount.items.map(orderItem => (
                    <div key={orderItem.item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{orderItem.item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(orderItem.item.price)} × {orderItem.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(selectedAccount.id, orderItem.item.id, orderItem.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{orderItem.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(selectedAccount.id, orderItem.item.id, orderItem.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItemFromAccount(selectedAccount.id, orderItem.item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="ml-4 font-medium min-w-[80px] text-right">
                        {formatCurrency(orderItem.price)}
                      </div>
                    </div>
                  ))}
                  {selectedAccount.items.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Žádné položky na účtě
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Celkem:</span>
                    <span className="text-primary">{formatCurrency(selectedAccount.total_price)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Coffee className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Vyberte účet pro zobrazení detailů</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Catalog - Only show when account is selected */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Katalog položek</CardTitle>
            <CardDescription>
              Klikněte na položku pro přidání do účtu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="itemSearch">Hledat položku</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="itemSearch"
                    placeholder="Název nebo PLU kód..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Kategorie</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny kategorie</SelectItem>
                    <SelectItem value="drinks">Nápoje</SelectItem>
                    <SelectItem value="food">Jídlo</SelectItem>
                    <SelectItem value="other">Ostatní</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addItemToAccount(selectedAccount.id, item)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium mb-1">{item.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      PLU: {item.plu_code || 'N/A'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{formatCurrency(item.price)}</span>
                      <Badge 
                        variant={item.stock > 0 ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {item.stock > 0 ? `${item.stock}ks` : 'Nedostupné'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredItems.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Žádné položky odpovídající kritériím
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};