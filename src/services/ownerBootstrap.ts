import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Service for ensuring owner account exists and is properly set up
 */
export class OwnerBootstrapService {
  private static readonly OWNER_EMAIL = 'admin@club.local';
  private static readonly OWNER_USERNAME = 'admin';
  private static readonly DEFAULT_PASSWORD = 'admin';

  /**
   * Check if owner account exists in database
   */
  static async checkOwnerExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'owner')
        .eq('username', this.OWNER_USERNAME)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking owner existence:', error);
      return false;
    }
  }

  /**
   * Create owner account through setup flow
   */
  static async createOwner(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: this.OWNER_EMAIL,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: 'Admin',
            username: this.OWNER_USERNAME
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Create/update user record
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            name: 'Admin',
            email: this.OWNER_EMAIL,
            username: this.OWNER_USERNAME,
            role: 'owner'
          });

        if (userError) {
          return { success: false, error: userError.message };
        }
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
    const ownerExists = await this.checkOwnerExists();
    
    if (!ownerExists) {
      // Redirect to setup page
      window.location.href = '/setup-owner';
      return false;
    }
    
    return true;
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
      const aliasEmail = `${userData.username}@club.local`;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: aliasEmail,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          username: userData.username
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Create user record
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            name: userData.name,
            email: aliasEmail,
            username: userData.username,
            phone: userData.phone,
            role: userData.role
          });

        if (userError) {
          return { success: false, error: userError.message };
        }
      }

      return { success: true, aliasEmail };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset staff user password
   */
  static async resetStaffPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}