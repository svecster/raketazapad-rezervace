export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_orders: {
        Row: {
          created_at: string | null
          id: string
          items: Json | null
          payment_confirmed_at: string | null
          payment_confirmed_by: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          reservation_id: string | null
          total_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          items?: Json | null
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          reservation_id?: string | null
          total_price?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json | null
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          reservation_id?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bar_orders_payment_confirmed_by_fkey"
            columns: ["payment_confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_orders_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          begins_at: string
          court_id: number
          created_at: string | null
          ends_at: string
          id: number
          notes: string | null
          price: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          begins_at: string
          court_id: number
          created_at?: string | null
          ends_at: string
          id?: number
          notes?: string | null
          price?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          begins_at?: string
          court_id?: number
          created_at?: string | null
          ends_at?: string
          id?: number
          notes?: string | null
          price?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cash_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          notes: string | null
          receipt_number: string | null
          reference_id: string | null
          reference_type: string | null
          shift_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          receipt_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          shift_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          receipt_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          shift_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_register: {
        Row: {
          balance: number | null
          cash_in: number | null
          cash_out: number | null
          created_at: string | null
          id: string
          notes: string | null
          shift_id: string | null
        }
        Insert: {
          balance?: number | null
          cash_in?: number | null
          cash_out?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          shift_id?: string | null
        }
        Update: {
          balance?: number | null
          cash_in?: number | null
          cash_out?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          shift_id?: string | null
        }
        Relationships: []
      }
      checkout_accounts: {
        Row: {
          assigned_players: Json
          checkout_id: string
          created_at: string
          id: string
          name: string
          paid_amount: number
          payment_methods: Json
          payment_status: string
          split_config: Json
          split_type: string
          total_amount: number
        }
        Insert: {
          assigned_players?: Json
          checkout_id: string
          created_at?: string
          id?: string
          name: string
          paid_amount?: number
          payment_methods?: Json
          payment_status?: string
          split_config?: Json
          split_type?: string
          total_amount?: number
        }
        Update: {
          assigned_players?: Json
          checkout_id?: string
          created_at?: string
          id?: string
          name?: string
          paid_amount?: number
          payment_methods?: Json
          payment_status?: string
          split_config?: Json
          split_type?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkout_accounts_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_items: {
        Row: {
          assigned_to_players: Json | null
          checkout_account_id: string | null
          checkout_id: string
          created_at: string
          description: string | null
          discount_code: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          name: string
          plu_code: string | null
          quantity: number
          total_price: number
          type: string
          unit_price: number
        }
        Insert: {
          assigned_to_players?: Json | null
          checkout_account_id?: string | null
          checkout_id: string
          created_at?: string
          description?: string | null
          discount_code?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          name: string
          plu_code?: string | null
          quantity?: number
          total_price: number
          type: string
          unit_price: number
        }
        Update: {
          assigned_to_players?: Json | null
          checkout_account_id?: string | null
          checkout_id?: string
          created_at?: string
          description?: string | null
          discount_code?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          name?: string
          plu_code?: string | null
          quantity?: number
          total_price?: number
          type?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkout_items_checkout_account_id_fkey"
            columns: ["checkout_account_id"]
            isOneToOne: false
            referencedRelation: "checkout_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_items_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_payments: {
        Row: {
          amount: number
          cash_change: number | null
          cash_received: number | null
          checkout_account_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          ledger_entry_id: string | null
          notes: string | null
          payment_method: string
          qr_code_data: string | null
          qr_payment_string: string | null
          qr_variable_symbol: string | null
        }
        Insert: {
          amount: number
          cash_change?: number | null
          cash_received?: number | null
          checkout_account_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          ledger_entry_id?: string | null
          notes?: string | null
          payment_method: string
          qr_code_data?: string | null
          qr_payment_string?: string | null
          qr_variable_symbol?: string | null
        }
        Update: {
          amount?: number
          cash_change?: number | null
          cash_received?: number | null
          checkout_account_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          ledger_entry_id?: string | null
          notes?: string | null
          payment_method?: string
          qr_code_data?: string | null
          qr_payment_string?: string | null
          qr_variable_symbol?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_payments_checkout_account_id_fkey"
            columns: ["checkout_account_id"]
            isOneToOne: false
            referencedRelation: "checkout_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_payments_ledger_entry_id_fkey"
            columns: ["ledger_entry_id"]
            isOneToOne: false
            referencedRelation: "cash_ledger"
            referencedColumns: ["id"]
          },
        ]
      }
      checkouts: {
        Row: {
          additional_reservations: Json | null
          created_at: string
          id: string
          include_court_price: boolean
          notes: string | null
          reservation_id: string | null
          staff_user_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          additional_reservations?: Json | null
          created_at?: string
          id?: string
          include_court_price?: boolean
          notes?: string | null
          reservation_id?: string | null
          staff_user_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          additional_reservations?: Json | null
          created_at?: string
          id?: string
          include_court_price?: boolean
          notes?: string | null
          reservation_id?: string | null
          staff_user_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkouts_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          id: string
          name: string
          seasonal_price_rules: Json | null
          status: Database["public"]["Enums"]["court_status"] | null
          type: Database["public"]["Enums"]["court_type"]
        }
        Insert: {
          id?: string
          name: string
          seasonal_price_rules?: Json | null
          status?: Database["public"]["Enums"]["court_status"] | null
          type: Database["public"]["Enums"]["court_type"]
        }
        Update: {
          id?: string
          name?: string
          seasonal_price_rules?: Json | null
          status?: Database["public"]["Enums"]["court_status"] | null
          type?: Database["public"]["Enums"]["court_type"]
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          item_name: string
          last_update: string | null
          stock: number | null
          unit_price: number
        }
        Insert: {
          id?: string
          item_name: string
          last_update?: string | null
          stock?: number | null
          unit_price: number
        }
        Update: {
          id?: string
          item_name?: string
          last_update?: string | null
          stock?: number | null
          unit_price?: number
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          cash_enabled: boolean
          created_at: string
          id: string
          qr_bank_code: string | null
          qr_default_message: string | null
          qr_enabled: boolean
          qr_enabled_for_bar: boolean
          qr_enabled_for_reservations: boolean
          qr_enabled_for_wallet: boolean
          qr_iban: string | null
          qr_recipient_name: string | null
          qr_variable_symbol_prefix: string | null
          updated_at: string
        }
        Insert: {
          cash_enabled?: boolean
          created_at?: string
          id?: string
          qr_bank_code?: string | null
          qr_default_message?: string | null
          qr_enabled?: boolean
          qr_enabled_for_bar?: boolean
          qr_enabled_for_reservations?: boolean
          qr_enabled_for_wallet?: boolean
          qr_iban?: string | null
          qr_recipient_name?: string | null
          qr_variable_symbol_prefix?: string | null
          updated_at?: string
        }
        Update: {
          cash_enabled?: boolean
          created_at?: string
          id?: string
          qr_bank_code?: string | null
          qr_default_message?: string | null
          qr_enabled?: boolean
          qr_enabled_for_bar?: boolean
          qr_enabled_for_reservations?: boolean
          qr_enabled_for_wallet?: boolean
          qr_iban?: string | null
          qr_recipient_name?: string | null
          qr_variable_symbol_prefix?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      price_rules: {
        Row: {
          court_type: string
          created_at: string | null
          id: string
          member_price: number
          non_member_price: number
          season: string
          time_period: string
          updated_at: string | null
        }
        Insert: {
          court_type: string
          created_at?: string | null
          id?: string
          member_price?: number
          non_member_price?: number
          season: string
          time_period: string
          updated_at?: string | null
        }
        Update: {
          court_type?: string
          created_at?: string | null
          id?: string
          member_price?: number
          non_member_price?: number
          season?: string
          time_period?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          court_id: string | null
          created_at: string | null
          end_time: string
          guest_contact: Json | null
          guest_token: string | null
          id: string
          payment_confirmed_at: string | null
          payment_confirmed_by: string | null
          payment_method: string | null
          price: number
          start_time: string
          status: Database["public"]["Enums"]["reservation_status"] | null
          user_id: string | null
        }
        Insert: {
          court_id?: string | null
          created_at?: string | null
          end_time: string
          guest_contact?: Json | null
          guest_token?: string | null
          id?: string
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_method?: string | null
          price: number
          start_time: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          user_id?: string | null
        }
        Update: {
          court_id?: string | null
          created_at?: string | null
          end_time?: string
          guest_contact?: Json | null
          guest_token?: string | null
          id?: string
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_method?: string | null
          price?: number
          start_time?: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_payment_confirmed_by_fkey"
            columns: ["payment_confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          closed_at: string | null
          closing_balance: number | null
          created_at: string
          id: string
          notes: string | null
          opening_balance: number
          staff_user_id: string | null
          status: Database["public"]["Enums"]["shift_status"]
        }
        Insert: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opening_balance?: number
          staff_user_id?: string | null
          status?: Database["public"]["Enums"]["shift_status"]
        }
        Update: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opening_balance?: number
          staff_user_id?: string | null
          status?: Database["public"]["Enums"]["shift_status"]
        }
        Relationships: [
          {
            foreignKeyName: "shifts_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          app_role: string
          created_at: string | null
          full_name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_role?: string
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_role?: string
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      calculate_checkout_totals: {
        Args: { checkout_uuid: string }
        Returns: undefined
      }
      generate_guest_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      court_status: "available" | "unavailable"
      court_type: "indoor" | "outdoor"
      payment_status: "open" | "paid"
      reservation_status: "booked" | "paid" | "cancelled"
      shift_status: "open" | "closed"
      transaction_type:
        | "cash_in"
        | "cash_out"
        | "qr_in"
        | "sale_cash"
        | "refund_cash"
        | "shift_payout"
      user_role: "player" | "staff" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      court_status: ["available", "unavailable"],
      court_type: ["indoor", "outdoor"],
      payment_status: ["open", "paid"],
      reservation_status: ["booked", "paid", "cancelled"],
      shift_status: ["open", "closed"],
      transaction_type: [
        "cash_in",
        "cash_out",
        "qr_in",
        "sale_cash",
        "refund_cash",
        "shift_payout",
      ],
      user_role: ["player", "staff", "owner"],
    },
  },
} as const
