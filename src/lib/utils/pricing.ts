import { getSeasonFromDate } from './datetime';
import { Court } from '@/types/reservation';

/**
 * Calculate slot price based on court, date, time and user membership
 */
export function calculateSlotPrice(
  court: Court,
  date: Date,
  time: string, // HH:MM format
  isMember: boolean = false
): number | null {
  try {
    const season = getSeasonFromDate(date);
    const hour = parseInt(time.split(':')[0]);
    
    // Determine time period
    const timePeriod = hour >= 7 && hour < 13 ? 'morning' : 'evening';
    
    // Build the rule key
    const ruleKey = `${season}_${timePeriod}_${court.type}_${isMember ? 'member' : 'non_member'}`;
    
    // Try to find exact rule
    if (court.seasonal_price_rules && court.seasonal_price_rules[ruleKey]) {
      // Price is per hour, we need 30-minute price
      return court.seasonal_price_rules[ruleKey] / 2;
    }
    
    // Fallback to base price if available
    const baseKey = `${season}_${court.type}`;
    if (court.seasonal_price_rules && court.seasonal_price_rules[baseKey]) {
      const basePrice = court.seasonal_price_rules[baseKey];
      // Apply time and membership modifiers
      let price = basePrice;
      if (timePeriod === 'evening') price *= 1.1; // 10% evening surcharge
      if (!isMember) price *= 1.2; // 20% non-member surcharge
      return price / 2; // 30-minute price
    }
    
    return null; // No pricing rule found
  } catch (error) {
    console.error('Error calculating slot price:', error);
    return null;
  }
}

/**
 * Format price for display
 */
export function formatSlotPrice(price: number | null): string {
  if (price === null || isNaN(price)) {
    return 'N/A';
  }
  
  return `${Math.round(price)} Kč`;
}