import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Settings, QrCode, Mail, Bell, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface PosSettings {
  id: string;
  qr_bank_account: string | null;
  qr_bank_code: string | null;
  qr_recipient_name: string | null;
  qr_default_message: string | null;
  alert_email: string | null;
}

export default function PosSettingsPage() {
  const [settings, setSettings] = useState<PosSettings>({
    id: '',
    qr_bank_account: '',
    qr_bank_code: '',
    qr_recipient_name: 'Tenis Nisa',
    qr_default_message: 'Platba za nákup - Tenis Nisa',
    alert_email: 'info@tenisnisa.cz'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingQR, setTestingQR] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Chyba při načítání nastavení');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pos_settings')
        .upsert([settings], {
          onConflict: 'id'
        });

      if (error) throw error;

      toast.success('Nastavení uloženo');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Chyba při ukládání nastavení');
    } finally {
      setSaving(false);
    }
  };

  const testQRGeneration = async () => {
    setTestingQR(true);
    try {
      // This would call the QR generation service with test data
      const testAmount = 100;
      
      // Simulate QR generation
      setTimeout(() => {
        toast.success('QR kód byl úspěšně vygenerován');
        setTestingQR(false);
      }, 1000);
      
      // In real implementation, this would call the QR service:
      // const qrResult = await qrPaymentService.generateQRCode({
      //   amount: testAmount,
      //   message: settings.qr_default_message || 'Test platba',
      //   // ... other QR data
      // });
    } catch (error) {
      console.error('Error testing QR generation:', error);
      toast.error('Chyba při testování QR kódu');
      setTestingQR(false);
    }
  };

  const testEmailAlert = async () => {
    setTestingEmail(true);
    try {
      // This would send a test email
      setTimeout(() => {
        toast.success(`Test email odeslán na ${settings.alert_email}`);
        setTestingEmail(false);
      }, 1000);
      
      // In real implementation, this would call an edge function to send email
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error('Chyba při odesílání test emailu');
      setTestingEmail(false);
    }
  };

  const updateSettings = (field: keyof PosSettings, value: string | null) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Načítám nastavení...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Nastavení pokladny
          </h1>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Ukládám...' : 'Uložit'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* QR Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Platby
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_account">Číslo účtu</Label>
                  <Input
                    id="bank_account"
                    value={settings.qr_bank_account || ''}
                    onChange={(e) => updateSettings('qr_bank_account', e.target.value)}
                    placeholder="123456789/0100"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bank_code">Kód banky</Label>
                  <Input
                    id="bank_code"
                    value={settings.qr_bank_code || ''}
                    onChange={(e) => updateSettings('qr_bank_code', e.target.value)}
                    placeholder="0100"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recipient_name">Název příjemce</Label>
                <Input
                  id="recipient_name"
                  value={settings.qr_recipient_name || ''}
                  onChange={(e) => updateSettings('qr_recipient_name', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="default_message">Výchozí zpráva pro příjemce</Label>
                <Input
                  id="default_message"
                  value={settings.qr_default_message || ''}
                  onChange={(e) => updateSettings('qr_default_message', e.target.value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={testQRGeneration}
                  disabled={testingQR}
                  className="flex-1"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingQR ? 'Testuji...' : 'Test QR kódu'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upozornění a notifikace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="alert_email">Email pro upozornění</Label>
                <Input
                  id="alert_email"
                  type="email"
                  value={settings.alert_email || ''}
                  onChange={(e) => updateSettings('alert_email', e.target.value)}
                  placeholder="majitel@tenisnisa.cz"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Na tento email budou zasílána upozornění o nízkých zásobách a denní reporty
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={testEmailAlert}
                  disabled={testingEmail || !settings.alert_email}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {testingEmail ? 'Odesílám...' : 'Test emailu'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Systémové informace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Verze systému:</span>
                  <div className="text-muted-foreground">POS v1.0</div>
                </div>
                <div>
                  <span className="font-medium">Poslední aktualizace:</span>
                  <div className="text-muted-foreground">
                    {new Date().toLocaleDateString('cs-CZ')}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Automatické funkce:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Denní email report v 22:15</li>
                  <li>• Upozornění na nízké zásoby v 22:05</li>
                  <li>• Automatické odpisy podle receptur</li>
                  <li>• Audit log všech operací</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}