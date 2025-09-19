/**
 * Hook for managing owner's view mode switching
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type ViewMode = 'owner' | 'staff' | 'player';

export const useViewMode = () => {
  const { isOwner } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('owner');

  // Load saved view mode from localStorage
  useEffect(() => {
    if (isOwner) {
      const saved = localStorage.getItem('tennis-club-view-mode') as ViewMode;
      if (saved && ['owner', 'staff', 'player'].includes(saved)) {
        setViewMode(saved);
      }
    } else {
      // Non-owners can't switch view modes
      setViewMode('player');
    }
  }, [isOwner]);

  const switchViewMode = (mode: ViewMode) => {
    if (!isOwner) return; // Only owners can switch modes
    
    setViewMode(mode);
    localStorage.setItem('tennis-club-view-mode', mode);
  };

  // Get navigation items based on current view mode
  const getNavigationForMode = () => {
    switch (viewMode) {
      case 'owner':
        return [
          { path: '/admin/majitel', label: 'Přehled', icon: 'BarChart3' },
          { path: '/admin/rezervace', label: 'Rezervace', icon: 'Calendar' },
          { path: '/admin/uzivatele', label: 'Uživatelé', icon: 'Users' },
          { path: '/admin/bar-ucty', label: 'Bar & účty', icon: 'Coffee' },
          { path: '/admin/sklad', label: 'Sklad', icon: 'Package' },
          { path: '/admin/reporty', label: 'Reporty', icon: 'FileText' },
          { path: '/admin/audit', label: 'Audit', icon: 'Shield' },
          { path: '/admin/nastaveni', label: 'Nastavení', icon: 'Settings' },
          { path: '/admin/pokladna', label: 'Pokladna', icon: 'Banknote' }
        ];
      case 'staff':
        return [
          { path: '/obsluha/prehled', label: 'Přehled', icon: 'BarChart3' },
          { path: '/obsluha/rezervace', label: 'Rezervace', icon: 'Calendar' },
          { path: '/obsluha/bar-ucty', label: 'Bar účty', icon: 'Coffee' },
          { path: '/obsluha/vybaveni', label: 'Vybavení', icon: 'Zap' },
          { path: '/obsluha/zakaznici', label: 'Zákazníci', icon: 'Users' },
          { path: '/obsluha/pokladna', label: 'Pokladna', icon: 'Banknote' }
        ];
      case 'player':
        return [
          { path: '/rezervace', label: 'Rezervace', icon: 'Calendar' },
          { path: '/moje-rezervace', label: 'Moje rezervace', icon: 'CalendarCheck' },
          { path: '/profil', label: 'Profil', icon: 'User' }
        ];
      default:
        return [];
    }
  };

  // Get display name for current mode
  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'owner':
        return 'Režim: Majitel';
      case 'staff':
        return 'Režim: Personál';
      case 'player':
        return 'Režim: Hráč';
    }
  };

  // Get icon for current mode
  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'owner':
        return 'Crown';
      case 'staff':
        return 'UserCog';
      case 'player':
        return 'User';
    }
  };

  return {
    viewMode,
    switchViewMode,
    getNavigationForMode,
    getViewModeLabel,
    getViewModeIcon,
    canSwitchMode: isOwner
  };
};