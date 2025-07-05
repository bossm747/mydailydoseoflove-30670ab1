export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          asset_name: string
          asset_type: string
          condition: string | null
          created_at: string
          depreciation_rate: number | null
          description: string | null
          documents: Json | null
          estimated_value: number
          id: string
          insurance_value: number | null
          location: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          warranty_expiry: string | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          condition?: string | null
          created_at?: string
          depreciation_rate?: number | null
          description?: string | null
          documents?: Json | null
          estimated_value: number
          id?: string
          insurance_value?: number | null
          location?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          warranty_expiry?: string | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          condition?: string | null
          created_at?: string
          depreciation_rate?: number | null
          description?: string | null
          documents?: Json | null
          estimated_value?: number
          id?: string
          insurance_value?: number | null
          location?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number_masked: string | null
          account_type: string
          created_at: string
          credit_limit: number | null
          currency: string | null
          current_balance: number
          id: string
          institution_name: string
          interest_rate: number | null
          is_active: boolean | null
          last_updated: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number_masked?: string | null
          account_type: string
          created_at?: string
          credit_limit?: number | null
          currency?: string | null
          current_balance?: number
          id?: string
          institution_name: string
          interest_rate?: number | null
          is_active?: boolean | null
          last_updated?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number_masked?: string | null
          account_type?: string
          created_at?: string
          credit_limit?: number | null
          currency?: string | null
          current_balance?: number
          id?: string
          institution_name?: string
          interest_rate?: number | null
          is_active?: boolean | null
          last_updated?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          chart_type: string | null
          created_at: string
          date_range: string | null
          filters: Json
          id: string
          is_scheduled: boolean | null
          report_name: string
          report_type: string
          schedule_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chart_type?: string | null
          created_at?: string
          date_range?: string | null
          filters: Json
          id?: string
          is_scheduled?: boolean | null
          report_name: string
          report_type: string
          schedule_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chart_type?: string | null
          created_at?: string
          date_range?: string | null
          filters?: Json
          id?: string
          is_scheduled?: boolean | null
          report_name?: string
          report_type?: string
          schedule_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          auto_pay: boolean | null
          created_at: string
          creditor_name: string
          current_balance: number
          debt_name: string
          debt_type: string
          due_date: string | null
          id: string
          interest_rate: number
          is_active: boolean | null
          maturity_date: string | null
          minimum_payment: number | null
          original_amount: number
          payment_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_pay?: boolean | null
          created_at?: string
          creditor_name: string
          current_balance: number
          debt_name: string
          debt_type: string
          due_date?: string | null
          id?: string
          interest_rate: number
          is_active?: boolean | null
          maturity_date?: string | null
          minimum_payment?: number | null
          original_amount: number
          payment_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_pay?: boolean | null
          created_at?: string
          creditor_name?: string
          current_balance?: number
          debt_name?: string
          debt_type?: string
          due_date?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          maturity_date?: string | null
          minimum_payment?: number | null
          original_amount?: number
          payment_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          location: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          location?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          location?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_forecasts: {
        Row: {
          base_amount: number
          category: string | null
          created_at: string
          end_date: string
          forecast_period: string
          forecast_type: string
          growth_rate: number | null
          id: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_amount: number
          category?: string | null
          created_at?: string
          end_date: string
          forecast_period: string
          forecast_type: string
          growth_rate?: number | null
          id?: string
          notes?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_amount?: number
          category?: string | null
          created_at?: string
          end_date?: string
          forecast_period?: string
          forecast_type?: string
          growth_rate?: number | null
          id?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          memory_date: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          memory_date: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          memory_date?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: []
      }
      mood_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          intensity: number
          is_private: boolean | null
          location: string | null
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          intensity?: number
          is_private?: boolean | null
          location?: string | null
          mood: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          intensity?: number
          is_private?: boolean | null
          location?: string | null
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          email_notifications: boolean | null
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          marketing_emails: boolean | null
          primary_currency: string | null
          push_notifications: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          marketing_emails?: boolean | null
          primary_currency?: string | null
          push_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          marketing_emails?: boolean | null
          primary_currency?: string | null
          push_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          transaction_date: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          id?: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
