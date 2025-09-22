import { format, addMinutes, parseISO, isSameDay } from 'date-fns';
import { Slot, Block } from '@/types/reservation';

/**
 * Check if two slots are adjacent (same court, same day, time connects)
 */
export function isAdjacent(a: Slot, b: Slot): boolean {
  if (a.courtId !== b.courtId || a.date !== b.date) return false;
  
  // Check if a.endsAt equals b.startsAt or vice versa
  return a.endsAt === b.startsAt || b.endsAt === a.startsAt;
}

/**
 * Merge an array of slots into a continuous block
 */
export function mergeSlotsToBlock(slots: Slot[], courtName: string): Block {
  if (slots.length === 0) {
    throw new Error('Cannot merge empty slots array');
  }

  // Sort slots by start time
  const sortedSlots = [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  
  const firstSlot = sortedSlots[0];
  const lastSlot = sortedSlots[sortedSlots.length - 1];
  
  const totalPrice = sortedSlots.reduce((sum, slot) => sum + slot.price, 0);
  
  return {
    courtId: firstSlot.courtId,
    courtName,
    date: firstSlot.date,
    start: format(parseISO(firstSlot.startsAt), 'HH:mm'),
    end: format(parseISO(lastSlot.endsAt), 'HH:mm'),
    slots: sortedSlots,
    totalPrice
  };
}

/**
 * Toggle a slot in the blocks array - add/remove and merge/split as needed
 */
export function toggleSlot(blocks: Block[], slot: Slot, courtName: string): Block[] {
  // Find if this slot already exists in any block
  let existingBlockIndex = -1;
  let existingSlotIndex = -1;
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const slotIndex = block.slots.findIndex(s => 
      s.courtId === slot.courtId && 
      s.date === slot.date && 
      s.startsAt === slot.startsAt
    );
    
    if (slotIndex !== -1) {
      existingBlockIndex = i;
      existingSlotIndex = slotIndex;
      break;
    }
  }
  
  if (existingBlockIndex !== -1) {
    // Slot exists, remove it
    const existingBlock = blocks[existingBlockIndex];
    const newSlots = existingBlock.slots.filter((_, index) => index !== existingSlotIndex);
    
    const newBlocks = blocks.filter((_, index) => index !== existingBlockIndex);
    
    if (newSlots.length > 0) {
      // Check if remaining slots still form continuous blocks
      const continuousGroups = groupContinuousSlots(newSlots);
      continuousGroups.forEach(group => {
        if (group.length > 0) {
          newBlocks.push(mergeSlotsToBlock(group, courtName));
        }
      });
    }
    
    return newBlocks;
  } else {
    // Slot doesn't exist, add it
    // Find adjacent blocks
    const adjacentBlocks: number[] = [];
    
    blocks.forEach((block, index) => {
      if (block.courtId === slot.courtId && block.date === slot.date) {
        const blockHasAdjacentSlot = block.slots.some(blockSlot => 
          isAdjacent(blockSlot, slot)
        );
        
        if (blockHasAdjacentSlot) {
          adjacentBlocks.push(index);
        }
      }
    });
    
    if (adjacentBlocks.length === 0) {
      // No adjacent blocks, create new block
      return [...blocks, mergeSlotsToBlock([slot], courtName)];
    } else {
      // Merge with adjacent blocks
      const nonAdjacentBlocks = blocks.filter((_, index) => !adjacentBlocks.includes(index));
      
      let allSlots = [slot];
      adjacentBlocks.forEach(blockIndex => {
        allSlots = allSlots.concat(blocks[blockIndex].slots);
      });
      
      const newBlock = mergeSlotsToBlock(allSlots, courtName);
      return [...nonAdjacentBlocks, newBlock];
    }
  }
}

/**
 * Group slots into continuous sequences
 */
function groupContinuousSlots(slots: Slot[]): Slot[][] {
  if (slots.length === 0) return [];
  
  const sortedSlots = [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const groups: Slot[][] = [];
  let currentGroup = [sortedSlots[0]];
  
  for (let i = 1; i < sortedSlots.length; i++) {
    const prevSlot = sortedSlots[i - 1];
    const currentSlot = sortedSlots[i];
    
    if (isAdjacent(prevSlot, currentSlot)) {
      currentGroup.push(currentSlot);
    } else {
      groups.push(currentGroup);
      currentGroup = [currentSlot];
    }
  }
  
  groups.push(currentGroup);
  return groups;
}

/**
 * Generate time slots for a day (30-minute intervals)
 */
export function generateTimeSlots(startHour: number = 7, endHour: number = 22): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < endHour) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  
  return slots;
}