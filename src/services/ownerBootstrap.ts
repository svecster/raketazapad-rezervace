import { supabase } from '@/integrations/supabase/client';

/**
 * Service for ensuring owner account exists and is properly set up
 */
export class OwnerBootstrapService {
  private static readonly OWNER_EMAIL = 'admin@club.local';
  private static readonly OWNER_USERNAME = 'admin';

  /**
   * Check if owner account exists (both auth and public user)
   */
  static async checkOwnerExists(): Promise<{ exists: boolean; needsSetup: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'check' }
      });

      if (error) {
        console.error('Error checking owner existence:', error);
        return { exists: false, needsSetup: true, error: error.message };
      }

      return { 
        exists: data.authUserExists && data.publicUserExists, 
        needsSetup: data.needsSetup 
      };
    } catch (error: any) {
      console.error('Error checking owner existence:', error);
      return { exists: false, needsSetup: true, error: error.message };
    }
  }

  /**
   * Create owner account with default credentials
   */
  static async createOwner(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'create' }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update owner password through admin API
   */
  static async updateOwnerPassword(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (password.length < 8) {
        return { success: false, error: 'Heslo musí mít alespoň 8 znaků' };
      }

      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'updatePassword', password }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Try to ensure owner exists, redirect to setup if needed
   */
  static async ensureOwner(): Promise<boolean> {
    try {
      console.log('Checking if owner exists...');
      const { exists, needsSetup, error } = await this.checkOwnerExists();
      
      if (error) {
        console.error('Error checking owner:', error);
        window.location.href = '/setup-owner';
        return false;
      }
      
      console.log('Owner check result:', { exists, needsSetup });
      
      if (needsSetup) {
        console.log('Owner needs setup, attempting to create...');
        // Try to create owner with default credentials first
        const createResult = await this.createOwner();
        console.log('Owner creation result:', createResult);
        
        if (createResult.success) {
          console.log('Owner created successfully');
          return true;
        }
        
        console.log('Owner creation failed, redirecting to setup');
        // If creation fails, redirect to setup page
        window.location.href = '/setup-owner';
        return false;
      }
      
      console.log('Owner exists:', exists);
      return exists;
    } catch (error) {
      console.error('Error ensuring owner:', error);
      window.location.href = '/setup-owner';
      return false;
    }
  }

  /**
   * Create staff user with username and alias email
   */
  static async createStaffUser(userData: {
    username: string;
    name: string;
    phone?: string;
    password: string;
    role: 'staff' | 'owner';
  }): Promise<{ success: boolean; error?: string; aliasEmail?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'createStaffUser', userData }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true, aliasEmail: data.aliasEmail };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Assigns owner role to a specific email address
   * @param email - Email address to assign owner role to
   * @returns Promise with success/error result
   */
  static async assignOwnerByEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Assigning owner role to email:', email);
      
      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'assignOwnerByEmail', email }
      });

      if (error) {
        console.error('Edge function error:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        console.error('Assignment failed:', data?.error);
        return { success: false, error: data?.error || 'Unknown error' };
      }

      console.log('Owner role assigned successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error in assignOwnerByEmail:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset staff user password
   */
  static async resetStaffPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'resetStaffPassword', userData: { userId, newPassword } }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user data
   */
  static async updateUser(userData: {
    id: string;
    username?: string;
    name: string;
    email: string;
    phone?: string;
    role: 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner';
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'updateUser', userData }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('owner-bootstrap', {
        body: { action: 'deleteUser', userData: { userId } }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}