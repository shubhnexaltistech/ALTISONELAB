export interface ApiListResponse<T> {
  data: T[];
  total?: number;
}

export interface ApiMessageResponse {
  message: string;
}

export interface Assignment {
  id: string;
  module_id: string;
  module_title?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  mentor_feedback?: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  assignment_title?: string;
  content?: string;
  repo_url?: string;
  status: string;
  mentor_feedback?: string;
  submitted_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  unique_id?: string;
  track_id?: string;
  track_name?: string;
  is_active: boolean;
  progress_pct?: number;
}
