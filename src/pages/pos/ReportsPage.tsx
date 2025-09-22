import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, Package, CreditCard, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';

interface SalesReport {
  totalSales: number;
  cashSales: number;
  qrSales: number;
  totalTransactions: number;
  averageTransaction: number;
}

interface ProductSales {
  product_id: number;
  product_name: string;
  category: string;
  total_qty: number;
  total_revenue: number;
  total_profit?: number;
}

interface CategoryReport {
  category: string;
  revenue: number;
  transactions: number;
}

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  
  const [salesReport, setSalesReport] = useState<SalesReport>({
    totalSales: 0,
    cashSales: 0,
    qrSales: 0,
    totalTransactions: 0,
    averageTransaction: 0
  });
  
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
    generateReport();
  }, []);

  useEffect(() => {
    generateReport();
  }, [dateFrom, dateTo, selectedCategory]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(data?.map(p => p.category) || []));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSalesReport(),
        loadProductSales(),
        loadCategoryReports()
      ]);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Chyba při generování reportu');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    try {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('total_amount, payment_method')
        .eq('status', 'paid')
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`);

      if (error) throw error;

      const totalSales = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const cashSales = sales?.filter(s => s.payment_method === 'cash').reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const qrSales = sales?.filter(s => s.payment_method === 'qr').reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const totalTransactions = sales?.length || 0;

      setSalesReport({
        totalSales,
        cashSales,
        qrSales,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0
      });
    } catch (error) {
      console.error('Error loading sales report:', error);
    }
  };

  const loadProductSales = async () => {
    try {
      let query = supabase
        .from('sale_items')
        .select(`
          product_id,
          qty,
          total,
          products!inner(name, category, cost_price)
        `)
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`);

      if (selectedCategory !== 'all') {
        query = query.eq('products.category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<number, ProductSales>();
      
      data?.forEach(item => {
        const productId = item.product_id;
        const existing = productMap.get(productId);
        const product = item.products as any;

        if (existing) {
          existing.total_qty += Number(item.qty);
          existing.total_revenue += Number(item.total);
          if (product.cost_price) {
            existing.total_profit = (existing.total_profit || 0) + 
              (Number(item.total) - (Number(product.cost_price) * Number(item.qty)));
          }
        } else {
          const newProduct: ProductSales = {
            product_id: productId,
            product_name: product.name,
            category: product.category,
            total_qty: Number(item.qty),
            total_revenue: Number(item.total)
          };

          if (product.cost_price) {
            newProduct.total_profit = Number(item.total) - (Number(product.cost_price) * Number(item.qty));
          }

          productMap.set(productId, newProduct);
        }
      });

      const sortedProducts = Array.from(productMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue);

      setProductSales(sortedProducts);
    } catch (error) {
      console.error('Error loading product sales:', error);
    }
  };

  const loadCategoryReports = async () => {
    try {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          total,
          products!inner(category)
        `)
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`);

      if (error) throw error;

      // Aggregate by category
      const categoryMap = new Map<string, CategoryReport>();
      
      data?.forEach(item => {
        const product = item.products as any;
        const category = product.category;
        const existing = categoryMap.get(category);

        if (existing) {
          existing.revenue += Number(item.total);
          existing.transactions += 1;
        } else {
          categoryMap.set(category, {
            category,
            revenue: Number(item.total),
            transactions: 1
          });
        }
      });

      const sortedCategories = Array.from(categoryMap.values())
        .sort((a, b) => b.revenue - a.revenue);

      setCategoryReports(sortedCategories);
    } catch (error) {
      console.error('Error loading category reports:', error);
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Produkt', 'Kategorie', 'Množství', 'Tržby', 'Marže'].join(','),
      ...productSales.map(product => [
        `"${product.product_name}"`,
        product.category,
        product.total_qty,
        product.total_revenue,
        product.total_profit || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${dateFrom}_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Report exportován do CSV');
  };

  const formatDateRange = () => {
    return `${new Date(dateFrom).toLocaleDateString('cs-CZ')} - ${new Date(dateTo).toLocaleDateString('cs-CZ')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Reporty a analýzy</h1>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Od:</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Do:</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategorie:</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny kategorie</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={generateReport} disabled={loading} className="w-full">
                  {loading ? 'Generuji...' : 'Aktualizovat'}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <Calendar className="inline h-4 w-4 mr-1" />
              Období: {formatDateRange()}
            </div>
          </CardContent>
        </Card>

        {/* Sales Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Celkové tržby</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(salesReport.totalSales)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hotovost</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesReport.cashSales)}
              </div>
              <p className="text-xs text-muted-foreground">
                {salesReport.totalSales > 0 ? 
                  Math.round((salesReport.cashSales / salesReport.totalSales) * 100) : 0}% z celku
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR platby</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesReport.qrSales)}
              </div>
              <p className="text-xs text-muted-foreground">
                {salesReport.totalSales > 0 ? 
                  Math.round((salesReport.qrSales / salesReport.totalSales) * 100) : 0}% z celku
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Průměrný nákup</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesReport.averageTransaction)}
              </div>
              <p className="text-xs text-muted-foreground">
                {salesReport.totalTransactions} transakcí
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Nejprodávanější produkty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productSales.slice(0, 10).map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{product.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category} • {product.total_qty} ks
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(product.total_revenue)}
                      </div>
                      {product.total_profit !== undefined && (
                        <div className="text-sm text-muted-foreground">
                          Marže: {formatCurrency(product.total_profit)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {productSales.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Žádné prodeje v tomto období
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Tržby podle kategorií</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryReports.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.transactions} prodejů
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(category.revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {salesReport.totalSales > 0 ? 
                          Math.round((category.revenue / salesReport.totalSales) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
                
                {categoryReports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Žádné kategorie v tomto období
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}