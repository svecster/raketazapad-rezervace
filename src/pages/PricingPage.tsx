import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export const PricingPage = () => {
  // Placeholder data - will be made dynamic in later phases
  const seasons = [
    {
      name: 'Léto',
      period: 'Duben - Říjen',
      courts: [
        {
          name: 'Antukový kurt 1-4',
          prices: {
            regular: 300,
            member: 250
          }
        }
      ]
    },
    {
      name: 'Zima',
      period: 'Listopad - Březen',
      courts: [
        {
          name: 'Tenisová hala',
          timeSlots: [
            {
              time: '7:00-13:00',
              prices: {
                regular: 400,
                member: 350
              }
            },
            {
              time: '13:00-23:00',
              prices: {
                regular: 500,
                member: 450
              }
            }
          ]
        }
      ]
    }
  ];

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold">
              Ceník
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transparentní ceny pro všechny naše služby
            </p>
          </div>

          <div className="space-y-12">
            {seasons.map((season) => (
              <Card key={season.name} className="overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-heading">
                      {season.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/20">
                      {season.period}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {season.courts.map((court) => (
                    <div key={court.name} className="p-6">
                      <h3 className="text-lg font-heading font-semibold mb-4">
                        {court.name}
                      </h3>
                      
                      {court.timeSlots ? (
                        // Hala with time slots
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4">Čas</th>
                                <th className="text-center py-3 px-4">Nečlen</th>
                                <th className="text-center py-3 px-4">Člen</th>
                              </tr>
                            </thead>
                            <tbody>
                              {court.timeSlots.map((slot) => (
                                <tr key={slot.time} className="border-b">
                                  <td className="py-3 px-4 font-medium">{slot.time}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="text-lg font-semibold">
                                      {slot.prices.regular} Kč
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="text-lg font-semibold text-primary">
                                      {slot.prices.member} Kč
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        // Simple pricing for outdoor courts
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="text-center p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Nečlen</h4>
                            <span className="text-2xl font-bold">
                              {court.prices.regular} Kč
                            </span>
                            <p className="text-sm text-muted-foreground">za hodinu</p>
                          </div>
                          <div className="text-center p-4 border rounded-lg bg-primary/5 border-primary/20">
                            <h4 className="font-medium mb-2">Člen</h4>
                            <span className="text-2xl font-bold text-primary">
                              {court.prices.member} Kč
                            </span>
                            <p className="text-sm text-muted-foreground">za hodinu</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Important Info */}
          <Card className="mt-12 bg-section-bg border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold">Důležité informace</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Ceny jsou uvedeny za jednu hodinu hraní</li>
                    <li>• Členství klubu přináší zvýhodněné ceny</li>
                    <li>• Rezervace lze zrušit do 19:00 předchozího dne</li>
                    <li>• Při nepříznivém počasí jsou venkovní kurty uzavřeny</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4">
                    Aktualizováno: {new Date().toLocaleDateString('cs-CZ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
};