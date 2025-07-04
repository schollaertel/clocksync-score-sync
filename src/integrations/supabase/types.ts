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
      field_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          field_id: string
          id: string
          is_active: boolean | null
          scorekeeper_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          field_id: string
          id?: string
          is_active?: boolean | null
          scorekeeper_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          field_id?: string
          id?: string
          is_active?: boolean | null
          scorekeeper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_assignments_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          created_at: string | null
          id: string
          location: string
          name: string
          organization_id: string | null
          qr_code: string
          qr_code_expires_at: string | null
          qr_code_locked: boolean | null
          qr_code_type: string | null
          qr_code_updated_at: string | null
          qr_code_updated_by: string | null
          subscription_plan: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location: string
          name: string
          organization_id?: string | null
          qr_code: string
          qr_code_expires_at?: string | null
          qr_code_locked?: boolean | null
          qr_code_type?: string | null
          qr_code_updated_at?: string | null
          qr_code_updated_by?: string | null
          subscription_plan?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string
          name?: string
          organization_id?: string | null
          qr_code?: string
          qr_code_expires_at?: string | null
          qr_code_locked?: boolean | null
          qr_code_type?: string | null
          qr_code_updated_at?: string | null
          qr_code_updated_by?: string | null
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
      game_events: {
        Row: {
          created_at: string
          description: string | null
          event_time: string
          event_type: string
          game_id: string
          game_time_remaining: number | null
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_time?: string
          event_type: string
          game_id: string
          game_time_remaining?: number | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_time?: string
          event_type?: string
          game_id?: string
          game_time_remaining?: number | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "game_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
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
          current_period: number | null
          field_id: string | null
          game_status: string | null
          home_score: number | null
          home_team: string
          home_team_logo_url: string | null
          id: string
          intermission_length_minutes: number | null
          last_updated: string | null
          period_length_minutes: number | null
          period_start_time: string | null
          scheduled_time: string
          time_remaining: number | null
          total_periods: number | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_logo_url?: string | null
          created_at?: string | null
          current_period?: number | null
          field_id?: string | null
          game_status?: string | null
          home_score?: number | null
          home_team: string
          home_team_logo_url?: string | null
          id?: string
          intermission_length_minutes?: number | null
          last_updated?: string | null
          period_length_minutes?: number | null
          period_start_time?: string | null
          scheduled_time: string
          time_remaining?: number | null
          total_periods?: number | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_logo_url?: string | null
          created_at?: string | null
          current_period?: number | null
          field_id?: string | null
          game_status?: string | null
          home_score?: number | null
          home_team?: string
          home_team_logo_url?: string | null
          id?: string
          intermission_length_minutes?: number | null
          last_updated?: string | null
          period_length_minutes?: number | null
          period_start_time?: string | null
          scheduled_time?: string
          time_remaining?: number | null
          total_periods?: number | null
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
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          game_updates: boolean | null
          id: string
          payment_reminders: boolean | null
          system_alerts: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          game_updates?: boolean | null
          id?: string
          payment_reminders?: boolean | null
          system_alerts?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          game_updates?: boolean | null
          id?: string
          payment_reminders?: boolean | null
          system_alerts?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          created_at: string
          event_types: string[]
          field_id: string | null
          game_id: string | null
          id: string
          is_active: boolean
          push_endpoint: string | null
          push_keys: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_types?: string[]
          field_id?: string | null
          game_id?: string | null
          id?: string
          is_active?: boolean
          push_endpoint?: string | null
          push_keys?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_types?: string[]
          field_id?: string | null
          game_id?: string | null
          id?: string
          is_active?: boolean
          push_endpoint?: string | null
          push_keys?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_subscriptions_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_subscriptions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      penalties: {
        Row: {
          created_at: string
          duration_minutes: number
          expires_at: string
          game_id: string
          id: string
          is_active: boolean
          penalty_type: string
          player_name: string
          started_at: string
          team: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          expires_at: string
          game_id: string
          id?: string
          is_active?: boolean
          penalty_type: string
          player_name: string
          started_at?: string
          team: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          expires_at?: string
          game_id?: string
          id?: string
          is_active?: boolean
          penalty_type?: string
          player_name?: string
          started_at?: string
          team?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalties_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
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
          organization_type: string | null
          parent_organization_id: string | null
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
          organization_type?: string | null
          parent_organization_id?: string | null
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
          organization_type?: string | null
          parent_organization_id?: string | null
          plan_tier?: string | null
          stripe_customer_id?: string | null
          total_games_played?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_code_audit: {
        Row: {
          action: string
          created_at: string | null
          field_id: string | null
          id: string
          new_expires_at: string | null
          new_qr_code: string | null
          old_expires_at: string | null
          old_qr_code: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          new_expires_at?: string | null
          new_qr_code?: string | null
          old_expires_at?: string | null
          old_qr_code?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          new_expires_at?: string | null
          new_qr_code?: string | null
          old_expires_at?: string | null
          old_qr_code?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_audit_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_code_scans: {
        Row: {
          created_at: string
          field_id: string | null
          id: string
          ip_address: unknown | null
          scan_time: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          field_id?: string | null
          id?: string
          ip_address?: unknown | null
          scan_time?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          field_id?: string | null
          id?: string
          ip_address?: unknown | null
          scan_time?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_scans_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
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
      spectator_analytics: {
        Row: {
          created_at: string
          engagement_score: number | null
          field_id: string | null
          game_id: string | null
          id: string
          page_views: number | null
          session_duration: number | null
        }
        Insert: {
          created_at?: string
          engagement_score?: number | null
          field_id?: string | null
          game_id?: string | null
          id?: string
          page_views?: number | null
          session_duration?: number | null
        }
        Update: {
          created_at?: string
          engagement_score?: number | null
          field_id?: string | null
          game_id?: string | null
          id?: string
          page_views?: number | null
          session_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spectator_analytics_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectator_analytics_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      spectator_registrations: {
        Row: {
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          registered_at: string | null
          user_id: string
        }
        Insert: {
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          registered_at?: string | null
          user_id: string
        }
        Update: {
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          registered_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role_name: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      ad_type: "top_banner" | "main_grid" | "bottom_banner"
      app_role:
        | "super_admin"
        | "admin"
        | "director"
        | "scorekeeper"
        | "spectator"
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
      app_role: [
        "super_admin",
        "admin",
        "director",
        "scorekeeper",
        "spectator",
      ],
    },
  },
} as const
