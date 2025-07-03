
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
  // Enhanced fields for period management
  current_period: number;
  total_periods: number;
  period_length_minutes: number;
  intermission_length_minutes: number;
  period_start_time?: string;
  last_updated?: string;
}

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

export interface GameEvent {
  id: string;
  game_id: string;
  event_type: 'goal' | 'penalty' | 'penalty_end' | 'period_start' | 'period_end' | 'game_start' | 'game_end' | 'timeout';
  event_time: string;
  game_time_remaining?: number;
  description?: string;
  metadata?: {
    team?: 'home' | 'away';
    player_name?: string;
    penalty_id?: string;
    period?: number;
    [key: string]: any;
  };
  created_at: string;
}

export interface NotificationSubscription {
  id: string;
  user_id?: string;
  game_id?: string;
  field_id?: string;
  event_types: ('penalty_end' | 'period_end' | 'goal' | 'game_start' | 'game_end')[];
  is_active: boolean;
  push_endpoint?: string;
  push_keys?: {
    p256dh: string;
    auth: string;
  };
  created_at: string;
}

export interface GameWithDetails extends Game {
  penalties?: Penalty[];
  recent_events?: GameEvent[];
  field?: Field;
}

export interface PenaltyWithTimeLeft extends Penalty {
  time_left_seconds: number;
  time_left_display: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    game_id: string;
    event_type: string;
    url?: string;
  };
}

export interface AudioAlert {
  type: 'penalty_end' | 'period_end' | 'goal' | 'timeout';
  frequency: number;
  duration: number;
  pattern: 'single' | 'double' | 'triple' | 'continuous';
}

export type QRCodeType = 'permanent' | 'temporary';

export interface Field {
  id: string;
  name: string;
  location: string;
  organization_id: string;
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
  field_id: string;
  advertiser_name: string;
  position: string;
  ad_image_url?: string;
  monthly_rate?: number;
  is_active: boolean;
  created_at: string;
}

export interface QRCodeAudit {
  id: string;
  field_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'locked' | 'unlocked' | 'regenerated';
  old_qr_code?: string;
  new_qr_code?: string;
  old_expires_at?: string;
  new_expires_at?: string;
  reason?: string;
  created_at: string;
}
