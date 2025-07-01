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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          role?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          ad_type: string
          commission_pct: number
          created_at: string | null
          end_date: string | null
          field_id: string | null
          id: string
          is_active: boolean | null
          paid: boolean | null
          price: number
          sponsor_name: string
          start_date: string | null
        }
        Insert: {
          ad_type: string
          commission_pct: number
          created_at?: string | null
          end_date?: string | null
          field_id?: string | null
          id?: string
          is_active?: boolean | null
          paid?: boolean | null
          price: number
          sponsor_name: string
          start_date?: string | null
        }
        Update: {
          ad_type?: string
          commission_pct?: number
          created_at?: string | null
          end_date?: string | null
          field_id?: string | null
          id?: string
          is_active?: boolean | null
          paid?: boolean | null
          price?: number
          sponsor_name?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          ad_image_url: string | null
          advertiser_name: string
          created_at: string | null
          field_id: string | null
          id: string
          is_active: boolean | null
          monthly_rate: number | null
          position: string
        }
        Insert: {
          ad_image_url?: string | null
          advertiser_name: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          is_active?: boolean | null
          monthly_rate?: number | null
          position?: string
        }
        Update: {
          ad_image_url?: string | null
          advertiser_name?: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          is_active?: boolean | null
          monthly_rate?: number | null
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          admin_email: string | null
          created_at: string | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_email?: string | null
          created_at?: string | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_email?: string | null
          created_at?: string | null
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      connect_accounts: {
        Row: {
          account_status: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          stripe_account_id: string | null
        }
        Insert: {
          account_status?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_account_id?: string | null
        }
        Update: {
          account_status?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connect_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          flag_name: string
          id: string
          is_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flag_name: string
          id?: string
          is_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flag_name?: string
          id?: string
          is_enabled?: boolean | null
        }
        Relationships: []
      }
      fields: {
        Row: {
          created_at: string | null
          id: string
          location: string
          name: string
          organization_id: string | null
          qr_code: string
          subscription_plan: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location: string
          name: string
          organization_id?: string | null
          qr_code: string
          subscription_plan?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string
          name?: string
          organization_id?: string | null
          qr_code?: string
          subscription_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fields_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number | null
          away_team: string
          away_team_logo_url: string | null
          created_at: string | null
          field_id: string | null
          game_status: string | null
          home_score: number | null
          home_team: string
          home_team_logo_url: string | null
          id: string
          scheduled_time: string
          time_remaining: number | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_logo_url?: string | null
          created_at?: string | null
          field_id?: string | null
          game_status?: string | null
          home_score?: number | null
          home_team: string
          home_team_logo_url?: string | null
          id?: string
          scheduled_time: string
          time_remaining?: number | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_logo_url?: string | null
          created_at?: string | null
          field_id?: string | null
          game_status?: string | null
          home_score?: number | null
          home_team?: string
          home_team_logo_url?: string | null
          id?: string
          scheduled_time?: string
          time_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          platform_revenue: number | null
          total_arr: number | null
          total_mrr: number | null
          total_organizations: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          platform_revenue?: number | null
          total_arr?: number | null
          total_mrr?: number | null
          total_organizations?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          platform_revenue?: number | null
          total_arr?: number | null
          total_mrr?: number | null
          total_organizations?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_ads_count: number | null
          commission_pct: number | null
          created_at: string | null
          email: string
          fields_count: number | null
          full_name: string
          id: string
          organization: string
          plan_tier: string | null
          stripe_customer_id: string | null
          total_games_played: number | null
          updated_at: string | null
        }
        Insert: {
          active_ads_count?: number | null
          commission_pct?: number | null
          created_at?: string | null
          email: string
          fields_count?: number | null
          full_name: string
          id?: string
          organization: string
          plan_tier?: string | null
          stripe_customer_id?: string | null
          total_games_played?: number | null
          updated_at?: string | null
        }
        Update: {
          active_ads_count?: number | null
          commission_pct?: number | null
          created_at?: string | null
          email?: string
          fields_count?: number | null
          full_name?: string
          id?: string
          organization?: string
          plan_tier?: string | null
          stripe_customer_id?: string | null
          total_games_played?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_analytics: {
        Row: {
          created_at: string | null
          id: string
          month_year: string
          organization_id: string | null
          platform_fees: number | null
          sponsor_revenue: number | null
          subscription_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          month_year: string
          organization_id?: string | null
          platform_fees?: number | null
          sponsor_revenue?: number | null
          subscription_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          month_year?: string
          organization_id?: string | null
          platform_fees?: number | null
          sponsor_revenue?: number | null
          subscription_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spectator_access: {
        Row: {
          accessed_at: string | null
          field_id: string | null
          id: string
        }
        Insert: {
          accessed_at?: string | null
          field_id?: string | null
          id?: string
        }
        Update: {
          accessed_at?: string | null
          field_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spectator_access_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_payments: {
        Row: {
          advertisement_id: string | null
          amount: number
          created_at: string | null
          id: string
          payment_date: string | null
          platform_fee: number | null
          status: string | null
        }
        Insert: {
          advertisement_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          platform_fee?: number | null
          status?: string | null
        }
        Update: {
          advertisement_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          platform_fee?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_payments_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          id: string
          monthly_price: number | null
          organization_id: string | null
          plan_type: string
          status: string
          stripe_subscription_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          monthly_price?: number | null
          organization_id?: string | null
          plan_type?: string
          status?: string
          stripe_subscription_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          monthly_price?: number | null
          organization_id?: string | null
          plan_type?: string
          status?: string
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_sample_fields_for_user: {
        Args: { user_id: string; user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      ad_type: "top_banner" | "main_grid" | "bottom_banner"
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
    Enums: {
      ad_type: ["top_banner", "main_grid", "bottom_banner"],
    },
  },
} as const
