import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardList, Plus, Save, Eye, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  stock_qty: number;
  track_stock: boolean;
}

interface InventorySession {
  id: number;
  started_at: string;
  closed_at: string | null;
  started_by: string | null;
}

interface InventoryCount {
  product_id: number;
  counted_qty: number;
  note: string | null;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [activeSession, setActiveSession] = useState<InventorySession | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewInventoryModal, setShowNewInventoryModal] = useState(false);
  const [showInventoryDetails, setShowInventoryDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<InventorySession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadSessions(),
        loadProducts(),
        loadActiveSession()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Chyba při načítání dat');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('inventory_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) throw error;
    setSessions(data || []);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, unit, stock_qty, track_stock')
      .eq('is_active', true)
      .eq('track_stock', true)
      .order('category, name');

    if (error) throw error;
    setProducts(data || []);
  };

  const loadActiveSession = async () => {
    const { data, error } = await supabase
      .from('inventory_sessions')
      .select('*')
      .is('closed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      setActiveSession(data);
      await loadCounts(data.id);
    }
  };

  const loadCounts = async (sessionId: number) => {
    const { data, error } = await supabase
      .from('inventory_counts')
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;
    setCounts(data || []);
  };

  const startNewInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_sessions')
        .insert({
          started_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
      setCounts([]);
      setShowNewInventoryModal(false);
      toast.success('Inventura zahájena');
      
      await loadSessions();
    } catch (error) {
      console.error('Error starting inventory:', error);
      toast.error('Chyba při zahájení inventury');
    }
  };

  const updateCount = (productId: number, countedQty: number, note: string = '') => {
    const existingCount = counts.find(c => c.product_id === productId);
    
    if (existingCount) {
      setCounts(counts.map(c => 
        c.product_id === productId 
          ? { ...c, counted_qty: countedQty, note }
          : c
      ));
    } else {
      setCounts([...counts, { product_id: productId, counted_qty: countedQty, note }]);
    }
  };

  const closeInventory = async () => {
    if (!activeSession) return;

    try {
      // Save all counts
      const countsToSave = counts.map(count => ({
        ...count,
        session_id: activeSession.id
      }));

      const { error: countsError } = await supabase
        .from('inventory_counts')
        .upsert(countsToSave, { 
          onConflict: 'session_id,product_id'
        });

      if (countsError) throw countsError;

      // Close session
      const { error: sessionError } = await supabase
        .from('inventory_sessions')
        .update({ closed_at: new Date().toISOString() })
        .eq('id', activeSession.id);

      if (sessionError) throw sessionError;

      // Process inventory adjustments
      for (const count of counts) {
        const product = products.find(p => p.id === count.product_id);
        if (!product) continue;

        const delta = count.counted_qty - product.stock_qty;
        
        if (delta !== 0) {
          // Create stock movement
          await supabase
            .from('stock_movements')
            .insert({
              product_id: count.product_id,
              delta: delta,
              reason: 'inventory_adjust',
              ref_table: 'inventory_sessions',
              ref_id: activeSession.id,
              created_by: user?.id
            });

          // Update product stock
          await supabase
            .from('products')
            .update({ stock_qty: count.counted_qty })
            .eq('id', count.product_id);
        }
      }

      toast.success('Inventura uzavřena a zásoby upraveny');
      setActiveSession(null);
      setCounts([]);
      await loadData();
    } catch (error) {
      console.error('Error closing inventory:', error);
      toast.error('Chyba při uzavírání inventury');
    }
  };

  const getCountForProduct = (productId: number) => {
    return counts.find(c => c.product_id === productId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Načítám inventury...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Inventury</h1>
          <div className="flex gap-2">
            {activeSession ? (
              <Button onClick={closeInventory} variant="destructive">
                <Save className="h-4 w-4 mr-2" />
                Uzavřít inventuru
              </Button>
            ) : (
              <Button onClick={() => setShowNewInventoryModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nová inventura
              </Button>
            )}
          </div>
        </div>

        {/* Active Inventory */}
        {activeSession && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Aktivní inventura</CardTitle>
              <p className="text-sm text-muted-foreground">
                Zahájena: {formatDate(activeSession.started_at)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Počítání položek</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      Spočítáno: {counts.length} / {products.length} produktů
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Pokrok</h3>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(counts.length / products.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Products to count */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {products.map(product => {
                    const count = getCountForProduct(product.id);
                    
                    return (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Systém: {product.stock_qty} {product.unit} • {product.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Spočítáno"
                            value={count?.counted_qty || ''}
                            onChange={(e) => updateCount(product.id, parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">{product.unit}</span>
                          {count && (
                            <Badge variant="secondary" className="ml-2">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory History */}
        <Card>
          <CardHeader>
            <CardTitle>Historie inventur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                  <div>
                    <div className="font-medium">
                      Inventura #{session.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(session.started_at)}
                      {session.closed_at && ` - ${formatDate(session.closed_at)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.closed_at ? 'secondary' : 'default'}>
                      {session.closed_at ? 'Uzavřeno' : 'Probíhá'}
                    </Badge>
                    {session.closed_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          setShowInventoryDetails(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Zatím nebyla provedena žádná inventura</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Inventory Modal */}
      {showNewInventoryModal && (
        <Dialog open={true} onOpenChange={() => setShowNewInventoryModal(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zahájit novou inventuru</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Inventura bude zahrnovat všechny aktivní produkty se sledováním zásob ({products.length} produktů).
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Upozornění:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Po zahájení nemůžete změnit seznam produktů</li>
                  <li>• Spočítejte všechny produkty před uzavřením</li>
                  <li>• Systém automaticky upraví zásoby podle rozdílů</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewInventoryModal(false)}
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={startNewInventory}
                  className="flex-1"
                >
                  Zahájit inventuru
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}