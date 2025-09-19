/**
 * Checkout Page - Main page for cash register operations
 */

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { CheckoutWizard } from '@/components/checkout/CheckoutWizard';
import { CashRegisterManager } from '@/components/cash/CashRegisterManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Banknote } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="checkout" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checkout" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Nový Checkout
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Správa Pokladny
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="checkout">
            <CheckoutWizard />
          </TabsContent>
          
          <TabsContent value="register">
            <CashRegisterManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}