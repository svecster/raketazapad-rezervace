import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

interface ProductGridProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onProductSelect: (product: Product, qty?: number) => void;
}

export function ProductGrid({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  onProductSelect
}: ProductGridProps) {
  const [selectedQty, setSelectedQty] = useState(1);

  const handleProductClick = (product: Product) => {
    onProductSelect(product, selectedQty);
    setSelectedQty(1); // Reset quantity after adding
  };

  const isOutOfStock = (product: Product) => {
    return product.track_stock && product.stock_qty <= 0;
  };

  const isLowStock = (product: Product) => {
    return product.track_stock && product.stock_qty <= 5 && product.stock_qty > 0;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Vyhledat produkt (Ctrl+K)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Množství:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 5, 10].map((qty) => (
            <button
              key={qty}
              onClick={() => setSelectedQty(qty)}
              className={`px-3 py-1 rounded text-sm ${
                selectedQty === qty
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {qty}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min="1"
          value={selectedQty}
          onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-20"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card 
            key={product.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              isOutOfStock(product) ? 'opacity-50' : ''
            }`}
            onClick={() => !isOutOfStock(product) && handleProductClick(product)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {product.sku && (
                    <Badge variant="outline" className="text-xs">
                      {product.sku}
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-sm mb-2 flex-1">
                  {product.name}
                </h3>
                
                <div className="space-y-2">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(product.sell_price)}
                  </div>
                  
                  {product.track_stock && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sklad:</span>
                      <Badge 
                        variant={isOutOfStock(product) ? 'destructive' : isLowStock(product) ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {product.stock_qty} {product.unit}
                      </Badge>
                    </div>
                  )}
                  
                  <Badge variant="outline" className="w-full text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Žádné produkty nenalezeny</p>
        </div>
      )}
    </div>
  );
}