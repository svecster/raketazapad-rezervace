import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nastavení</h1>
          <p className="text-muted-foreground">
            Konfigurace systému a klubových nastavení
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <CardTitle>Obecná nastavení</CardTitle>
              </div>
              <CardDescription>
                Základní konfigurace klubu a rezervačního systému
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Nastavení bude brzy</p>
                <p className="text-muted-foreground">
                  Zde budou možnosti konfigurace klubu
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifikace</CardTitle>
                </div>
                <CardDescription>
                  Nastavení e-mailových a SMS upozornění
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Brzy dostupné</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Bezpečnost</CardTitle>
                </div>
                <CardDescription>
                  Správa přístupu a zabezpečení
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Brzy dostupné</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Vzhled</CardTitle>
                </div>
                <CardDescription>
                  Přizpůsobení vzhledu webu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Brzy dostupné</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}