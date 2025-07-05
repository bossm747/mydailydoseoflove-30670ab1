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
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
      business_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: Json | null
          business_name: string
          business_type: string | null
          created_at: string
          description: string | null
          email: string | null
          founded_date: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          owner_id: string
          phone: string | null
          primary_currency: string | null
          registration_number: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          business_name: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded_date?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          owner_id: string
          phone?: string | null
          primary_currency?: string | null
          registration_number?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          business_name?: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded_date?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          owner_id?: string
          phone?: string | null
          primary_currency?: string | null
          registration_number?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          created_at: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          decimal_places: number
          id: string
          is_active: boolean
          is_base_currency: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          decimal_places?: number
          id?: string
          is_active?: boolean
          is_base_currency?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_name?: string
          currency_symbol?: string
          decimal_places?: number
          id?: string
          is_active?: boolean
          is_base_currency?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
      customers: {
        Row: {
          address: Json | null
          billing_address: Json | null
          business_id: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string
          credit_limit: number | null
          customer_since: string | null
          customer_type: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          mobile: string | null
          notes: string | null
          payment_terms: string | null
          phone: string | null
          preferred_currency: string | null
          shipping_address: Json | null
          status: string | null
          tags: string[] | null
          tax_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          billing_address?: Json | null
          business_id?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_since?: string | null
          customer_type?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          mobile?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          preferred_currency?: string | null
          shipping_address?: Json | null
          status?: string | null
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          billing_address?: Json | null
          business_id?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_since?: string | null
          customer_type?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          mobile?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          preferred_currency?: string | null
          shipping_address?: Json | null
          status?: string | null
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          auto_pay: boolean | null
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
      employees: {
        Row: {
          address: Json | null
          avatar_url: string | null
          bank_details: Json | null
          base_salary: number | null
          benefits: Json | null
          business_id: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string | null
          emergency_contact: Json | null
          employee_id: string
          employment_status: string | null
          employment_type: string | null
          first_name: string
          hire_date: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          job_title: string
          last_name: string
          manager_id: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          salary_type: string | null
          tax_information: Json | null
          termination_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          bank_details?: Json | null
          base_salary?: number | null
          benefits?: Json | null
          business_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: Json | null
          employee_id: string
          employment_status?: string | null
          employment_type?: string | null
          first_name: string
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          job_title: string
          last_name: string
          manager_id?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          salary_type?: string | null
          tax_information?: Json | null
          termination_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          bank_details?: Json | null
          base_salary?: number | null
          benefits?: Json | null
          business_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: Json | null
          employee_id?: string
          employment_status?: string | null
          employment_type?: string | null
          first_name?: string
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          job_title?: string
          last_name?: string
          manager_id?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          salary_type?: string | null
          tax_information?: Json | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
      exchange_rates: {
        Row: {
          created_at: string
          exchange_rate: number
          from_currency: string
          id: string
          is_active: boolean
          rate_date: string
          source: string | null
          to_currency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exchange_rate: number
          from_currency: string
          id?: string
          is_active?: boolean
          rate_date?: string
          source?: string | null
          to_currency: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exchange_rate?: number
          from_currency?: string
          id?: string
          is_active?: boolean
          rate_date?: string
          source?: string | null
          to_currency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_forecasts: {
        Row: {
          base_amount: number
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
      inventory: {
        Row: {
          available_stock: number | null
          business_id: string | null
          created_at: string
          current_stock: number | null
          id: string
          incoming_stock: number | null
          last_counted_at: string | null
          last_counted_by: string | null
          location_name: string | null
          notes: string | null
          product_id: string
          reserved_stock: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_stock?: number | null
          business_id?: string | null
          created_at?: string
          current_stock?: number | null
          id?: string
          incoming_stock?: number | null
          last_counted_at?: string | null
          last_counted_by?: string | null
          location_name?: string | null
          notes?: string | null
          product_id: string
          reserved_stock?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_stock?: number | null
          business_id?: string | null
          created_at?: string
          current_stock?: number | null
          id?: string
          incoming_stock?: number | null
          last_counted_at?: string | null
          last_counted_by?: string | null
          location_name?: string | null
          notes?: string | null
          product_id?: string
          reserved_stock?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          business_id: string | null
          created_at: string
          created_by: string
          id: string
          location_name: string | null
          notes: string | null
          product_id: string
          quantity_change: number
          reason: string | null
          stock_after: number
          stock_before: number
          total_cost: number | null
          transaction_date: string | null
          transaction_reference: string | null
          transaction_type: string
          unit_cost: number | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          location_name?: string | null
          notes?: string | null
          product_id: string
          quantity_change: number
          reason?: string | null
          stock_after: number
          stock_before: number
          total_cost?: number | null
          transaction_date?: string | null
          transaction_reference?: string | null
          transaction_type: string
          unit_cost?: number | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          location_name?: string | null
          notes?: string | null
          product_id?: string
          quantity_change?: number
          reason?: string | null
          stock_after?: number
          stock_before?: number
          total_cost?: number | null
          transaction_date?: string | null
          transaction_reference?: string | null
          transaction_type?: string
          unit_cost?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          discount_rate: number | null
          id: string
          invoice_id: string
          item_name: string
          line_total: number
          quantity: number
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_rate?: number | null
          id?: string
          invoice_id: string
          item_name: string
          line_total?: number
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_rate?: number | null
          id?: string
          invoice_id?: string
          item_name?: string
          line_total?: number
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_due: number
          business_id: string | null
          created_at: string
          currency: string
          customer_id: string | null
          discount_amount: number
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          invoice_template: string | null
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_terms: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_amount: number
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          balance_due?: number
          business_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_amount?: number
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          invoice_template?: string | null
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_terms?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          balance_due?: number
          business_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_template?: string | null
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_terms?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          business_id: string | null
          company_name: string | null
          converted_at: string | null
          converted_to_customer: string | null
          created_at: string
          email: string | null
          estimated_value: number | null
          expected_close_date: string | null
          first_name: string
          id: string
          last_name: string | null
          lead_source: string | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          priority: string | null
          probability: number | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          business_id?: string | null
          company_name?: string | null
          converted_at?: string | null
          converted_to_customer?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          lead_source?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          probability?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          business_id?: string | null
          company_name?: string | null
          converted_at?: string | null
          converted_to_customer?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          lead_source?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          probability?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_to_customer_fkey"
            columns: ["converted_to_customer"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applied_at: string | null
          approved_at: string | null
          approved_by: string | null
          business_id: string | null
          created_at: string
          days_requested: number
          employee_id: string
          end_date: string
          id: string
          leave_type_id: string
          reason: string | null
          rejected_reason: string | null
          start_date: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_id?: string | null
          created_at?: string
          days_requested: number
          employee_id: string
          end_date: string
          id?: string
          leave_type_id: string
          reason?: string | null
          rejected_reason?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_id?: string | null
          created_at?: string
          days_requested?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type_id?: string
          reason?: string | null
          rejected_reason?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          business_id: string | null
          carry_forward: boolean | null
          created_at: string
          days_allowed: number | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          leave_code: string
          leave_name: string
          requires_approval: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          carry_forward?: boolean | null
          created_at?: string
          days_allowed?: number | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          leave_code: string
          leave_name: string
          requires_approval?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          carry_forward?: boolean | null
          created_at?: string
          days_allowed?: number | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          leave_code?: string
          leave_name?: string
          requires_approval?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      opportunities: {
        Row: {
          actual_close_date: string | null
          assigned_to: string | null
          business_id: string | null
          created_at: string
          custom_fields: Json | null
          customer_id: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          next_step: string | null
          next_step_date: string | null
          opportunity_name: string
          pipeline_id: string | null
          priority: string | null
          probability: number | null
          source: string | null
          stage: string
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to?: string | null
          business_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          customer_id?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          next_step?: string | null
          next_step_date?: string | null
          opportunity_name: string
          pipeline_id?: string | null
          priority?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          actual_close_date?: string | null
          assigned_to?: string | null
          business_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          customer_id?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          next_step?: string | null
          next_step_date?: string | null
          opportunity_name?: string
          pipeline_id?: string | null
          priority?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "sales_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_details: Json | null
          business_id: string | null
          created_at: string
          fees: Json | null
          id: string
          is_active: boolean
          is_default: boolean
          method_name: string
          method_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_details?: Json | null
          business_id?: string | null
          created_at?: string
          fees?: Json | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          method_name: string
          method_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_details?: Json | null
          business_id?: string | null
          created_at?: string
          fees?: Json | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          method_name?: string
          method_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          business_id: string | null
          created_at: string
          currency: string
          customer_id: string | null
          id: string
          invoice_id: string | null
          net_amount: number
          notes: string | null
          payment_date: string
          payment_gateway_response: Json | null
          payment_method_id: string | null
          payment_method_type: string
          payment_number: string
          processed_at: string | null
          reference_number: string | null
          status: string
          transaction_fee: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          net_amount: number
          notes?: string | null
          payment_date?: string
          payment_gateway_response?: Json | null
          payment_method_id?: string | null
          payment_method_type: string
          payment_number: string
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          transaction_fee?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          net_amount?: number
          notes?: string | null
          payment_date?: string
          payment_gateway_response?: Json | null
          payment_method_id?: string | null
          payment_method_type?: string
          payment_number?: string
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          transaction_fee?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_entries: {
        Row: {
          allowances: Json | null
          basic_salary: number | null
          bonuses: number | null
          business_id: string | null
          created_at: string
          employee_id: string
          gross_pay: number | null
          id: string
          net_pay: number | null
          other_deductions: Json | null
          overtime_hours: number | null
          overtime_pay: number | null
          overtime_rate: number | null
          pagibig_deduction: number | null
          payroll_period_id: string
          philhealth_deduction: number | null
          sss_deduction: number | null
          status: string | null
          tax_deduction: number | null
          total_deductions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allowances?: Json | null
          basic_salary?: number | null
          bonuses?: number | null
          business_id?: string | null
          created_at?: string
          employee_id: string
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          other_deductions?: Json | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          pagibig_deduction?: number | null
          payroll_period_id: string
          philhealth_deduction?: number | null
          sss_deduction?: number | null
          status?: string | null
          tax_deduction?: number | null
          total_deductions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allowances?: Json | null
          basic_salary?: number | null
          bonuses?: number | null
          business_id?: string | null
          created_at?: string
          employee_id?: string
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          other_deductions?: Json | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          pagibig_deduction?: number | null
          payroll_period_id?: string
          philhealth_deduction?: number | null
          sss_deduction?: number | null
          status?: string | null
          tax_deduction?: number | null
          total_deductions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          business_id: string | null
          created_at: string
          end_date: string
          id: string
          notes: string | null
          pay_date: string
          period_name: string
          start_date: string
          status: string | null
          total_deductions: number | null
          total_gross_pay: number | null
          total_net_pay: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          pay_date: string
          period_name: string
          start_date: string
          status?: string | null
          total_deductions?: number | null
          total_gross_pay?: number | null
          total_net_pay?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          pay_date?: string
          period_name?: string
          start_date?: string
          status?: string | null
          total_deductions?: number | null
          total_gross_pay?: number | null
          total_net_pay?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_periods_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          areas_for_improvement: string | null
          business_id: string | null
          completed_at: string | null
          created_at: string
          development_goals: string | null
          employee_comments: string | null
          employee_id: string
          goals_met: Json | null
          id: string
          manager_comments: string | null
          overall_rating: number | null
          review_period_end: string
          review_period_start: string
          review_type: string | null
          reviewer_id: string
          status: string | null
          strengths: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          areas_for_improvement?: string | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string
          development_goals?: string | null
          employee_comments?: string | null
          employee_id: string
          goals_met?: Json | null
          id?: string
          manager_comments?: string | null
          overall_rating?: number | null
          review_period_end: string
          review_period_start: string
          review_type?: string | null
          reviewer_id: string
          status?: string | null
          strengths?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          areas_for_improvement?: string | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string
          development_goals?: string | null
          employee_comments?: string | null
          employee_id?: string
          goals_met?: Json | null
          id?: string
          manager_comments?: string | null
          overall_rating?: number | null
          review_period_end?: string
          review_period_start?: string
          review_type?: string | null
          reviewer_id?: string
          status?: string | null
          strengths?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          business_id: string | null
          category_code: string | null
          category_name: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          parent_category_id: string | null
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          category_code?: string | null
          category_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          category_code?: string | null
          category_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          business_id: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          dimensions: Json | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_purchasable: boolean | null
          is_sellable: boolean | null
          is_trackable: boolean | null
          max_stock_level: number | null
          min_stock_level: number | null
          product_code: string
          product_name: string
          product_type: string | null
          reorder_point: number | null
          selling_price: number | null
          sku: string | null
          supplier_info: Json | null
          tags: string[] | null
          tax_rate: number | null
          unit_of_measure: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          business_id?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_purchasable?: boolean | null
          is_sellable?: boolean | null
          is_trackable?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_code: string
          product_name: string
          product_type?: string | null
          reorder_point?: number | null
          selling_price?: number | null
          sku?: string | null
          supplier_info?: Json | null
          tags?: string[] | null
          tax_rate?: number | null
          unit_of_measure?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          business_id?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_purchasable?: boolean | null
          is_sellable?: boolean | null
          is_trackable?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_code?: string
          product_name?: string
          product_type?: string | null
          reorder_point?: number | null
          selling_price?: number | null
          sku?: string | null
          supplier_info?: Json | null
          tags?: string[] | null
          tax_rate?: number | null
          unit_of_measure?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
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
      project_tasks: {
        Row: {
          actual_end_date: string | null
          actual_hours: number | null
          actual_start_date: string | null
          assigned_to: string | null
          business_id: string | null
          completion_percentage: number | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          priority: string | null
          project_id: string
          sort_order: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          task_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          assigned_to?: string | null
          business_id?: string | null
          completion_percentage?: number | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          project_id: string
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          task_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          assigned_to?: string | null
          business_id?: string | null
          completion_percentage?: number | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          task_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          actual_start_date: string | null
          billing_method: string | null
          budget: number | null
          business_id: string | null
          client_id: string | null
          completion_percentage: number | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          end_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          priority: string | null
          project_code: string
          project_manager_id: string | null
          project_name: string
          start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          billing_method?: string | null
          budget?: number | null
          business_id?: string | null
          client_id?: string | null
          completion_percentage?: number | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          project_code: string
          project_manager_id?: string | null
          project_name: string
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          billing_method?: string | null
          budget?: number | null
          business_id?: string | null
          client_id?: string | null
          completion_percentage?: number | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          project_code?: string
          project_manager_id?: string | null
          project_name?: string
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string | null
          discount_rate: number | null
          id: string
          item_name: string
          line_total: number
          quantity: number
          quote_id: string
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_rate?: number | null
          id?: string
          item_name: string
          line_total?: number
          quantity?: number
          quote_id: string
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_rate?: number | null
          id?: string
          item_name?: string
          line_total?: number
          quantity?: number
          quote_id?: string
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          business_id: string | null
          created_at: string
          currency: string | null
          customer_id: string | null
          description: string | null
          discount_amount: number | null
          discount_rate: number | null
          id: string
          notes: string | null
          opportunity_id: string | null
          quote_number: string
          rejected_at: string | null
          sent_at: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          terms_and_conditions: string | null
          title: string
          total_amount: number | null
          updated_at: string
          user_id: string
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_rate?: number | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          quote_number: string
          rejected_at?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_and_conditions?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_rate?: number | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          quote_number?: string
          rejected_at?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_and_conditions?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_activities: {
        Row: {
          activity_type: string
          assigned_to: string | null
          business_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          related_to_id: string
          related_to_type: string
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          assigned_to?: string | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_to_id: string
          related_to_type: string
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          assigned_to?: string | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_to_id?: string
          related_to_type?: string
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_pipeline: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          pipeline_name: string
          stages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          pipeline_name: string
          stages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          pipeline_name?: string
          stages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_pipeline_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
      tax_settings: {
        Row: {
          applies_to: string
          business_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_compound: boolean
          tax_name: string
          tax_rate: number
          tax_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applies_to?: string
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_compound?: boolean
          tax_name: string
          tax_rate: number
          tax_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applies_to?: string
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_compound?: boolean
          tax_name?: string
          tax_rate?: number
          tax_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_duration: number | null
          business_id: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string
          employee_id: string
          entry_date: string
          entry_type: string | null
          id: string
          location: Json | null
          notes: string | null
          overtime_hours: number | null
          status: string | null
          total_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_duration?: number | null
          business_id?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id: string
          entry_date: string
          entry_type?: string | null
          id?: string
          location?: Json | null
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_duration?: number | null
          business_id?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          entry_date?: string
          entry_type?: string | null
          id?: string
          location?: Json | null
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
