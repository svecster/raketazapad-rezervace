import { Trash2, Minus, Plus, X, Calculator, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';

interface Product {
  id: number;
  sku: string | null;
  name: string;
  category: string;
  unit: string;
  sell_price: number;
  stock_qty: number;
  track_stock: boolean;
  is_active: boolean;
}

interface CartItem {
  product: Product;
  qty: number;
  discount: number;
}

interface Reservation {
  id: string;
  start_time: string;
  end_time: string;
  court: { name: string };
  user: { name: string } | null;
  guest_contact: any;
  price: number;
}

interface ReceiptPanelProps {
  cart: CartItem[];
  linkedReservation: Reservation | null;
  onUpdateItem: (productId: number, qty: number, discount: number) => void;
  onRemoveItem: (productId: number) => void;
  onClear: () => void;
  onCashPayment: () => void;
  onQRPayment: () => void;
  total: number;
}

export function ReceiptPanel({
  cart,
  linkedReservation,
  onUpdateItem,
  onRemoveItem,
  onClear,
  onCashPayment,
  onQRPayment,
  total
}: ReceiptPanelProps) {
  const updateQuantity = (item: CartItem, delta: number) => {
    const newQty = Math.max(0, item.qty + delta);
    onUpdateItem(item.product.id, newQty, item.discount);
  };

  const updateDiscount = (item: CartItem, discount: number) => {
    onUpdateItem(item.product.id, item.qty, Math.max(0, discount));
  };

  const getItemTotal = (item: CartItem) => {
    return (item.product.sell_price * item.qty) - item.discount;
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Účtenka</CardTitle>
          {cart.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Vymazat
            </Button>
          )}
        </div>
        
        {linkedReservation && (
          <Badge variant="secondary" className="w-fit">
            Rezervace: {linkedReservation.court.name}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.product.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.product.sell_price)} / {item.product.unit}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-destructive hover:text-destructive p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item, -1)}
                  className="p-1 h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">
                  {item.qty}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item, 1)}
                  className="p-1 h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Discount */}
              <div className="flex items-center gap-2">
                <Calculator className="h-3 w-3 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Sleva"
                  value={item.discount || ''}
                  onChange={(e) => updateDiscount(item, parseFloat(e.target.value) || 0)}
                  className="h-8 text-sm"
                  min="0"
                  step="0.01"
                />
                <span className="text-xs text-muted-foreground">Kč</span>
              </div>

              {/* Item Total */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm">Celkem:</span>
                <span className="font-semibold">{formatCurrency(getItemTotal(item))}</span>
              </div>
            </div>
          ))}
        </div>

        {cart.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Prázdná účtenka</p>
            <p className="text-xs">Kliknutím na produkt ho přidáte</p>
          </div>
        )}

        {/* Total */}
        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Celkem:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Payment Buttons */}
        {cart.length > 0 && (
          <div className="space-y-2">
            <Button
              onClick={onCashPayment}
              className="w-full"
              size="lg"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Hotově
            </Button>
            <Button
              onClick={onQRPayment}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              QR Platba
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}