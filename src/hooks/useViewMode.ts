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
          { path: '/rezervace', label: 'Rezervace', icon: 'Calendar' },
          { path: '/admin/personal', label: 'Personál', icon: 'BarChart3' },
          { path: '/admin/majitel', label: 'Správa', icon: 'Settings' },
          { path: '/admin/pokladna', label: 'Pokladna', icon: 'Banknote' }
        ];
      case 'staff':
        return [
          { path: '/rezervace', label: 'Rezervace', icon: 'Calendar' },
          { path: '/admin/personal', label: 'Personál', icon: 'BarChart3' },
          { path: '/admin/pokladna', label: 'Pokladna', icon: 'Banknote' }
        ];
      case 'player':
        return [
          { path: '/rezervace', label: 'Rezervace', icon: 'Calendar' }
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