
export type AppRole = 'super_admin' | 'admin' | 'director' | 'scorekeeper' | 'spectator';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  organization_id?: string;
  created_at: string;
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
  first_name?: string;
  last_name?: string;
  registered_at: string;
}
