
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
  game_status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  time_remaining: number;
  created_at: string;
}

export interface Field {
  id: string;
  name: string;
  location: string;
  organization_id: string;
  qr_code: string;
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
