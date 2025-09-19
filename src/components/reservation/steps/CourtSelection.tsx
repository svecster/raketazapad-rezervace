import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin,
  Wifi,
  Zap,
  Sun,
  Home,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import type { CourtInfo } from '../ReservationModal';

interface CourtSelectionProps {
  selectedCourt?: CourtInfo;
  onCourtSelect: (court: CourtInfo) => void;
}

// Mock court data - replace with real data from Supabase
const mockCourts: CourtInfo[] = [
  {
    id: 'indoor-1',
    name: 'Indoor Kurt 1',
    type: 'indoor',
    basePrice: 800,
    features: ['Osvětlení', 'Zvukový systém', 'Klimatizace'],
    status: 'available'
  },
  {
    id: 'indoor-2',
    name: 'Indoor Kurt 2', 
    type: 'indoor',
    basePrice: 800,
    features: ['Osvětlení', 'Zvukový systém'],
    status: 'available'
  },
  {
    id: 'outdoor-1',
    name: 'Outdoor Kurt 1',
    type: 'outdoor',
    basePrice: 600,
    features: ['Osvětlení', 'Antuka'],
    status: 'available'
  },
  {
    id: 'outdoor-2',
    name: 'Outdoor Kurt 2',
    type: 'outdoor', 
    basePrice: 600,
    features: ['Osvětlení', 'Antuka'],
    status: 'occupied'
  },
  {
    id: 'outdoor-3',
    name: 'Outdoor Kurt 3',
    type: 'outdoor',
    basePrice: 600,
    features: ['Osvětlení', 'Antuka'],
    status: 'available'
  },
  {
    id: 'outdoor-4',
    name: 'Outdoor Kurt 4',
    type: 'outdoor',
    basePrice: 600,
    features: ['Osvětlení', 'Antuka'],
    status: 'available'
  }
];

const getFeatureIcon = (feature: string) => {
  switch (feature) {
    case 'Osvětlení':
      return <Zap className="h-3 w-3" />;
    case 'Zvukový systém':
      return <Wifi className="h-3 w-3" />;
    case 'Klimatizace':
      return <Home className="h-3 w-3" />;
    case 'Antuka':
      return <Sun className="h-3 w-3" />;
    default:
      return <MapPin className="h-3 w-3" />;
  }
};

const getStatusBadge = (status: CourtInfo['status']) => {
  switch (status) {
    case 'available':
      return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Dostupný</Badge>;
    case 'occupied':
      return <Badge variant="destructive">Obsazený</Badge>;
    case 'maintenance':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Údržba</Badge>;
    default:
      return null;
  }
};

export const CourtSelection = ({ selectedCourt, onCourtSelect }: CourtSelectionProps) => {
  const [activeTab, setActiveTab] = useState<'indoor' | 'outdoor'>('indoor');

  const indoorCourts = mockCourts.filter(court => court.type === 'indoor');
  const outdoorCourts = mockCourts.filter(court => court.type === 'outdoor');

  const renderCourtCard = (court: CourtInfo) => {
    const isSelected = selectedCourt?.id === court.id;
    const isDisabled = court.status !== 'available';

    return (
      <Card
        key={court.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-primary bg-primary/5 border-primary' 
            : isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-primary/50'
        }`}
        onClick={() => !isDisabled && onCourtSelect(court)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              {court.type === 'indoor' ? (
                <Home className="mr-2 h-5 w-5 text-primary" />
              ) : (
                <Sun className="mr-2 h-5 w-5 text-secondary" />
              )}
              {court.name}
              {isSelected && (
                <CheckCircle className="ml-2 h-4 w-4 text-primary" />
              )}
            </CardTitle>
            {getStatusBadge(court.status)}
          </div>
          <CardDescription>
            <span className="text-lg font-semibold text-primary">
              od {formatCurrency(court.basePrice)}
            </span>
            <span className="text-muted-foreground"> / hodina</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 mb-3">
            {court.features.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs flex items-center gap-1">
                {getFeatureIcon(feature)}
                {feature}
              </Badge>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {court.type === 'indoor' 
              ? 'Krytý kurt s klimatizací, ideální pro celý rok'
              : 'Venkovní kurt s antukovým povrchem, sezónní provoz'
            }
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Vyberte kurt</h2>
        <p className="text-muted-foreground">
          Máme {indoorCourts.length} indoor kurty a {outdoorCourts.length} outdoor kurty k dispozici
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'indoor' | 'outdoor')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="indoor" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Indoor ({indoorCourts.length})
          </TabsTrigger>
          <TabsTrigger value="outdoor" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Outdoor ({outdoorCourts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="indoor" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {indoorCourts.map(renderCourtCard)}
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Indoor kurty</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Dostupné celoročně</li>
              <li>• Klimatizace a vytápění</li>
              <li>• Kvalitní LED osvětlení</li>
              <li>• Zvukový systém pro turnaje</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="outdoor" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {outdoorCourts.map(renderCourtCard)}
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Outdoor kurty</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Antukový povrch</li>
              <li>• Sezónní provoz (březen - říjen)</li>
              <li>• Kvalitní LED osvětlení</li>
              <li>• Příjemné prostředí v přírodě</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};