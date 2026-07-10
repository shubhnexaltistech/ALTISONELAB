export type UserRole = "admin" | "trainee" | "mentor";

export interface UserProfile {
  name: string;
  phone?: string;
  avatar_url?: string;
  github_url?: string;
  college?: string;
  city?: string;
}

export interface AuthUser {
  user_id: string;
  role: UserRole;
  name: string;
  email?: string;
  unique_id?: string;
  emp_id?: string;
  track_id?: string;
}
