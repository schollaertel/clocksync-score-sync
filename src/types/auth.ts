export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  organization: string;
  organization_type?: OrganizationType; // Make optional
  plan_tier: PlanTier;
  commission_pct: number;
  total_games_played: number;
  active_ads_count: number;
  fields_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  signUp: (email: string, password: string, fullName: string, organization: string, organizationType?: OrganizationType) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  canAccessScoreboard: boolean;
  canCreateAds: boolean;
  refreshProfile: () => Promise<void>;
}
