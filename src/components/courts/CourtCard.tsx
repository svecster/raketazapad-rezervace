import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate, formatTime, getSeasonFromDate } from '@/lib/utils/datetime';

interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  seasonal_price_rules: Record<string, number>;
  status: 'available' | 'unavailable';
}

interface CourtCardProps {
  court: Court;
  selectedDate?: Date;
  selectedTime?: string;
  onReserve?: (courtId: string) => void;
  showPrice?: boolean;
}

export const CourtCard = ({ 
  court, 
  selectedDate = new Date(), 
  selectedTime, 
  onReserve, 
  showPrice = true 
}: CourtCardProps) => {
  const season = getSeasonFromDate(selectedDate);
  const price = court.seasonal_price_rules[season] || 0;
  const isIndoor = court.type === 'indoor';
  const isAvailable = court.status === 'available';

  const getSeasonName = (season: string) => {
    const seasons = {
      spring: 'Jaro',
      summer: 'Léto',
      autumn: 'Podzim',
      winter: 'Zima'
    };
    return seasons[season as keyof typeof seasons] || season;
  };

  return (
    <Card className={`court-card ${isIndoor ? 'court-indoor' : 'court-outdoor'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{court.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isIndoor ? 'default' : 'secondary'}
              className={isIndoor ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
            >
              {isIndoor ? 'Hala' : 'Venkovní'}
            </Badge>
            <Badge 
              variant={isAvailable ? 'outline' : 'destructive'}
              className={isAvailable ? 'status-available' : 'status-cancelled'}
            >
              {isAvailable ? 'Dostupný' : 'Nedostupný'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{isIndoor ? 'Vnitřní prostory' : 'Venkovní areál'}</span>
          </div>
          {selectedTime && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{selectedTime}</span>
            </div>
          )}
        </div>

        {showPrice && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Cena ({getSeasonName(season)}):
              </span>
              <span className="text-lg font-bold text-primary currency">
                {formatCurrency(price)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Na {formatDate(selectedDate)} • {formatTime(selectedDate)}
            </div>
          </div>
        )}

        {onReserve && (
          <Button 
            onClick={() => onReserve(court.id)}
            disabled={!isAvailable}
            className={`w-full ${isIndoor ? 'btn-court-indoor' : 'btn-court-outdoor'}`}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isAvailable ? 'Rezervovat' : 'Nedostupný'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};