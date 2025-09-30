import { PriceRule, Court, Reservation } from '@/types';

/**
 * Calculate reservation price based on court, date/time range and price rules
 */
export function calculateReservationPrice(
  court: Court,
  startTime: Date,
  endTime: Date,
  priceRules: PriceRule[],
  isMember: boolean = false
): number {
  try {
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Find matching price rule by court type
    const matchingRule = priceRules.find(rule => rule.court_type === court.type);
    
    if (!matchingRule) {
      // Fallback to default pricing
      const basePrice = court.type === 'indoor' ? 400 : 300;
      return basePrice * durationHours * (isMember ? 0.8 : 1);
    }
    
    // Apply member discount if applicable
    const pricePerHour = isMember ? matchingRule.member_price : matchingRule.non_member_price;
    return pricePerHour * durationHours;
    
  } catch (error) {
    console.error('Error calculating reservation price:', error);
    return 0;
  }
}

/**
 * Format price for display in Czech crowns
 */
export function formatPrice(price: number): string {
  return `${Math.round(price)} Kč`;
}

/**
 * Get time slots for a day (30-minute intervals)
 */
export function getTimeSlots(startHour: number = 8, endHour: number = 22): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  return slots;
}

/**
 * Check if a time slot is available
 */
export function isTimeSlotAvailable(
  courtId: string,
  date: Date,
  timeSlot: string,
  existingReservations: Reservation[]
): boolean {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotStart = new Date(date);
  slotStart.setHours(hours, minutes, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
  
  return !existingReservations.some(reservation => {
    if (reservation.court_id !== courtId) return false;
    
    const reservationStart = new Date(reservation.start_time);
    const reservationEnd = new Date(reservation.end_time);
    
    // Check for overlap
    return (slotStart < reservationEnd && slotEnd > reservationStart);
  });
}