export type QRCodeType = 'permanent' | 'temporary';

export interface Game {
  id: string;
  field_id: string | null;
  home_team: string;
  away_team: string;
  home_team_logo_url?: string | null;
  away_team_logo_url?: string | null;
  home_score: number;
  away_score: number;
  scheduled_time: string;
  game_status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'paused' | 'intermission';
  time_remaining: number;
  created_at: string | null;
  // Enhanced fields for period management
  current_period?: number | null;
  total_periods?: number | null;
  period_length_minutes?: number | null;
  intermission_length_minutes?: number | null;
  period_start_time?: string | null;
  last_updated?: string | null;
}

export interface Field {
  id: string;
  name: string;
  location: string;
  organization_id: string;
  qr_code: string;
  qr_code_type: string;
  qr_code_expires_at?: string | null;
  qr_code_locked: boolean;
  qr_code_updated_at: string | null;
  qr_code_updated_by?: string | null;
  subscription_plan?: string | null;
  created_at: string;
}

export interface Advertisement {
  id: string;
  field_id: string;
  advertiser_name: string;
  position: string;
  ad_image_url?: string | null;
  monthly_rate?: number | null;
  is_active: boolean;
  created_at: string;
}

// Phase 4: New Penalty Interface
export interface Penalty {
  id: string;
  game_id: string;
  team: 'home' | 'away';
  player_name: string;
  penalty_type: string;
  duration_minutes: number;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

// Phase 4: Game Event Interface
export interface GameEvent {
  id: string;
  game_id: string;
  event_type: 'goal' | 'penalty' | 'period_start' | 'period_end' | 'timeout' | 'substitution';
  event_time: string;
  game_time_remaining?: number;
  description?: string;
  metadata?: any;
  created_at: string;
}
