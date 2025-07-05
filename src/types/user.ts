
export type AppRole = 'super_admin' | 'admin' | 'director' | 'scorekeeper' | 'spectator';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  organization_id?: string | null;
  created_at: string | null;
}

export interface FieldAssignment {
  id: string;
  scorekeeper_id: string;
  field_id: string;
  assigned_by?: string;
  is_active: boolean;
  created_at: string;
}

export interface SpectatorRegistration {
  id: string;
  user_id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  registered_at: string | null;
}
