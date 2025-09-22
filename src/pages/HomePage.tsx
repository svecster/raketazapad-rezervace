import { PublicLayout } from '@/components/layout/PublicLayout';
import { Hero } from '@/components/home/Hero';
import { ServicesSection } from '@/components/home/ServicesSection';
import { OpeningHours } from '@/components/home/OpeningHours';
import { LocationSection } from '@/components/home/LocationSection';
import { CTASection } from '@/components/home/CTASection';

export const HomePage = () => {
  return (
    <PublicLayout>
      <Hero />
      <ServicesSection />
      <OpeningHours />
      <LocationSection />
      <CTASection />
    </PublicLayout>
  );
};