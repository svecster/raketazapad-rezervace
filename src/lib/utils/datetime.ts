import { format, parseISO, isValid, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { cs } from 'date-fns/locale';

/**
 * DateTime utilities for Czech locale and Europe/Prague timezone
 */

export const formatDate = (date: Date | string, formatStr: string = 'dd.MM.yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatStr, { locale: cs });
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'HH:mm', { locale: cs });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: cs });
};

export const formatDateTimeShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'd.M. HH:mm', { locale: cs });
};

export const formatDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'EEEE', { locale: cs });
};

export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  
  const today = new Date();
  return formatDate(dateObj) === formatDate(today);
};

export const isTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  
  const tomorrow = addDays(new Date(), 1);
  return formatDate(dateObj) === formatDate(tomorrow);
};

export const isYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  
  const yesterday = subDays(new Date(), 1);
  return formatDate(dateObj) === formatDate(yesterday);
};

export const getSeasonFromDate = (date: Date | string): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const month = dateObj.getMonth(); // 0-based
  
  if (month >= 2 && month <= 4) return 'spring'; // Mar, Apr, May
  if (month >= 5 && month <= 7) return 'summer'; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return 'autumn'; // Sep, Oct, Nov
  return 'winter'; // Dec, Jan, Feb
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  if (isToday(dateObj)) return `Dnes ${formatTime(dateObj)}`;
  if (isTomorrow(dateObj)) return `Zítra ${formatTime(dateObj)}`;
  if (isYesterday(dateObj)) return `Včera ${formatTime(dateObj)}`;
  
  return formatDateTime(dateObj);
};

// Working hours validation
export const WORKING_HOURS = {
  start: 7, // 7:00
  end: 23,  // 23:00
};

export const isWithinWorkingHours = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  
  const hour = dateObj.getHours();
  return hour >= WORKING_HOURS.start && hour <= WORKING_HOURS.end;
};

export const getWorkingHoursOptions = (): { value: string; label: string }[] => {
  const options = [];
  for (let hour = WORKING_HOURS.start; hour <= WORKING_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({
        value: timeStr,
        label: timeStr,
      });
    }
  }
  return options;
};