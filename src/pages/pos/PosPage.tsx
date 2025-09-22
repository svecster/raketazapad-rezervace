import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { ReceiptPanel } from '@/components/pos/ReceiptPanel';
import { QRPaymentModal } from '@/components/pos/QRPaymentModal';
import { ReservationSearchModal } from '@/components/pos/ReservationSearchModal';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';

export interface Product {
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

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
}

export interface Reservation {
  id: string;
  start_time: string;
  end_time: string;
  court: { name: string };
  user: { name: string } | null;
  guest_contact: any;
  price: number;
}

export default function PosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('všechny');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [linkedReservation, setLinkedReservation] = useState<Reservation | null>(null);
  
  const categories = ['všechny', 'Bar', 'Jídlo', 'Půjčovna', 'Míčky', 'Kurt/Hala'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('category, name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Chyba při načítání produktů');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, qty: number = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, qty: item.qty + qty }
          : item
      ));
    } else {
      setCart([...cart, { product, qty, discount: 0 }]);
    }
    
    toast.success(`${product.name} přidán do účtenky`);
  };

  const updateCartItem = (productId: number, qty: number, discount: number = 0) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, qty, discount }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setLinkedReservation(null);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = (item.product.sell_price * item.qty) - item.discount;
      return sum + itemTotal;
    }, 0);
  };

  const processCashPayment = async () => {
    if (cart.length === 0) {
      toast.error('Prázdná účtenka');
      return;
    }

    try {
      const total = getTotal();
      
      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user?.id,
          reservation_id: linkedReservation ? parseInt(linkedReservation.id) : null,
          total_amount: total,
          payment_method: 'cash',
          status: 'paid'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        qty: item.qty,
        unit_price: item.product.sell_price,
        discount: item.discount,
        total: (item.product.sell_price * item.qty) - item.discount
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      toast.success(`Prodej dokončen - ${formatCurrency(total)}`);
      clearCart();
      loadProducts(); // Refresh to show updated stock
    } catch (error) {
      console.error('Error processing cash payment:', error);
      toast.error('Chyba při zpracování platby');
    }
  };

  const processQRPayment = () => {
    if (cart.length === 0) {
      toast.error('Prázdná účtenka');
      return;
    }
    setShowQRModal(true);
  };

  const handleQRPaymentComplete = async () => {
    await processCashPayment(); // Same process, just different payment method
    setShowQRModal(false);
  };

  const linkReservation = (reservation: Reservation) => {
    setLinkedReservation(reservation);
    setShowReservationModal(false);
    toast.success(`Napojeno na rezervaci ${reservation.court.name}`);
  };

  const addCourtTime = () => {
    if (!linkedReservation) {
      toast.error('Nejprve navažte rezervaci');
      return;
    }

    // Create virtual product for court time
    const courtProduct: Product = {
      id: -1, // Virtual ID
      sku: null,
      name: `${linkedReservation.court.name} - ${new Date(linkedReservation.start_time).toLocaleDateString()}`,
      category: 'Kurt/Hala',
      unit: 'hod',
      sell_price: linkedReservation.price,
      stock_qty: 0,
      track_stock: false,
      is_active: true
    };

    addToCart(courtProduct);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'všechny' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Načítám produkty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Pokladna</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReservationModal(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              Navázat rezervaci
            </button>
            {linkedReservation && (
              <button
                onClick={addCourtTime}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Přidat kurt/hala
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Grid */}
          <div className="lg:col-span-2">
            <ProductGrid
              products={filteredProducts}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onProductSelect={addToCart}
            />
          </div>

          {/* Receipt Panel */}
          <div className="lg:col-span-1">
            <ReceiptPanel
              cart={cart}
              linkedReservation={linkedReservation}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeFromCart}
              onClear={clearCart}
              onCashPayment={processCashPayment}
              onQRPayment={processQRPayment}
              total={getTotal()}
            />
          </div>
        </div>
      </div>

      {showQRModal && (
        <QRPaymentModal
          amount={getTotal()}
          onClose={() => setShowQRModal(false)}
          onComplete={handleQRPaymentComplete}
        />
      )}

      {showReservationModal && (
        <ReservationSearchModal
          onClose={() => setShowReservationModal(false)}
          onSelect={linkReservation}
        />
      )}
    </div>
  );
}