export interface Game {
  id: string;
  field_id: string;
  home_team: string;
  away_team: string;
  home_team_logo_url?: string;
  away_team_logo_url?: string;
  home_score: number;
  away_score: number;
  scheduled_time: string;
  game_status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'paused' | 'intermission';
  time_remaining: number;
  created_at: string;
  // Enhanced fields for period management - making them optional with defaults
  current_period?: number;
  total_periods?: number;
  period_length_minutes?: number;
  intermission_length_minutes?: number;
  period_start_time?: string;
  last_updated?: string;
}

export interface Field {
  id: string;
  name: string;
  location: string;
  organization_id: string; // Making this required in our interface even though DB allows null
  qr_code: string;
  qr_code_type: QRCodeType;
  qr_code_expires_at?: string;
  qr_code_locked: boolean;
  qr_code_updated_at: string;
  qr_code_updated_by?: string;
  subscription_plan?: string;
  created_at: string;
}

export interface Advertisement {
  id: string;
  field_id: string; // Making this required in our interface even though DB allows null
  advertiser_name: string;
  position: string;
  ad_image_url?: string;
  monthly_rate?: number;
  is_active: boolean;
  created_at: string;
}

// Rest of interfaces stay the same...
