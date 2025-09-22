import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Minus, Search, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: number;
  sku: string | null;
  name: string;
  category: string;
  unit: string;
  sell_price: number;
  stock_qty: number;
  min_stock: number;
  track_stock: boolean;
  is_active: boolean;
}

interface StockMovementData {
  product_id: number;
  delta: number;
  reason: string;
  note?: string;
}

export default function StockPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementQty, setMovementQty] = useState(1);
  const [movementNote, setMovementNote] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('track_stock', true)
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

  const openMovementModal = (product: Product, type: 'in' | 'out') => {
    setSelectedProduct(product);
    setMovementType(type);
    setMovementQty(1);
    setMovementNote('');
    setShowMovementModal(true);
  };

  const handleStockMovement = async () => {
    if (!selectedProduct || movementQty <= 0) {
      toast.error('Neplatné množství');
      return;
    }

    try {
      const delta = movementType === 'in' ? movementQty : -movementQty;
      const reason = movementType === 'in' ? 'manual_in' : 'manual_out';

      // Create stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: selectedProduct.id,
          delta: delta,
          reason: reason,
          created_by: user?.id
        });

      if (movementError) throw movementError;

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_qty: selectedProduct.stock_qty + delta
        })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      const actionText = movementType === 'in' ? 'naskladněno' : 'odepsáno';
      toast.success(`${movementQty} ${selectedProduct.unit} ${actionText}`);
      
      setShowMovementModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error processing stock movement:', error);
      toast.error('Chyba při zpracování skladového pohybu');
    }
  };

  const isLowStock = (product: Product) => {
    return product.stock_qty <= product.min_stock;
  };

  const isOutOfStock = (product: Product) => {
    return product.stock_qty <= 0;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockProducts = products.filter(isLowStock);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Načítám sklad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sklad</h1>
          <div className="flex gap-2">
            <Badge variant={lowStockProducts.length > 0 ? 'destructive' : 'secondary'}>
              {lowStockProducts.length} položek pod minimem
            </Badge>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Nízké zásoby
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-orange-600 ml-2">
                      ({product.stock_qty} {product.unit} zbývá)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Hledat produkty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Produkt</th>
                    <th className="text-left p-4">Kategorie</th>
                    <th className="text-left p-4">Cena</th>
                    <th className="text-left p-4">Skladem</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.sku && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {product.sku}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{product.category}</Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(product.sell_price)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {product.stock_qty} {product.unit}
                          </span>
                          {isOutOfStock(product) && (
                            <Badge variant="destructive" className="text-xs">
                              Vyprodáno
                            </Badge>
                          )}
                          {isLowStock(product) && !isOutOfStock(product) && (
                            <Badge variant="secondary" className="text-xs">
                              Nízká zásoba
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">
                          Min: {product.min_stock} {product.unit}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMovementModal(product, 'in')}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMovementModal(product, 'out')}
                            disabled={isOutOfStock(product)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Žádné produkty nenalezeny</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement Modal */}
      {showMovementModal && selectedProduct && (
        <Dialog open={true} onOpenChange={() => setShowMovementModal(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {movementType === 'in' ? 'Naskladnit' : 'Odepsat'} - {selectedProduct.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Množství ({selectedProduct.unit}):</label>
                <Input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Poznámka (volitelná):</label>
                <Input
                  value={movementNote}
                  onChange={(e) => setMovementNote(e.target.value)}
                  className="mt-1"
                  placeholder="Důvod pohybu..."
                />
              </div>

              <div className="text-sm text-muted-foreground">
                Aktuálně skladem: {selectedProduct.stock_qty} {selectedProduct.unit}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={handleStockMovement}
                  className="flex-1"
                  variant={movementType === 'in' ? 'default' : 'destructive'}
                >
                  {movementType === 'in' ? 'Naskladnit' : 'Odepsat'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}