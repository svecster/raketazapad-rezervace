import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Block } from '@/types/reservation';
import { cn } from '@/lib/utils';

interface BookingSummaryProps {
  selectedBlocks: Block[];
  onRemoveBlock: (blockIndex: number) => void;
  onNextStep: () => void;
  className?: string;
}

export const BookingSummary = ({ 
  selectedBlocks, 
  onRemoveBlock, 
  onNextStep,
  className 
}: BookingSummaryProps) => {
  if (selectedBlocks.length === 0) {
    return null;
  }

  const totalPrice = selectedBlocks.reduce((sum, block) => sum + block.totalPrice, 0);

  return (
    <Card className={cn(
      "sticky bottom-0 p-4 bg-background border-t shadow-lg z-20",
      className
    )}>
      <div className="space-y-4">
        {/* Selected blocks */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">Vybrané termíny:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedBlocks.map((block, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="flex items-center gap-2 px-3 py-2 text-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-medium">{block.courtName}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{format(parseISO(`${block.date}T00:00:00`), 'd.M.yyyy', { locale: cs })}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{block.start}–{block.end}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium">{Math.round(block.totalPrice)} Kč</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive/10"
                  onClick={() => onRemoveBlock(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Total and actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-lg font-semibold">
            Celkem: <span className="text-primary">{Math.round(totalPrice)} Kč</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => selectedBlocks.forEach((_, index) => onRemoveBlock(index))}
            >
              Zrušit výběr
            </Button>
            <Button onClick={onNextStep}>
              Další krok ({selectedBlocks.length} {selectedBlocks.length === 1 ? 'termín' : selectedBlocks.length < 5 ? 'termíny' : 'termínů'})
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};