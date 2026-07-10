export interface Track {
  id: string;
  name: string;
  code: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  module_count?: number;
  fee_inr?: number;
  duration?: string;
  highlights?: string;
  outcomes?: string;
}

export interface TrackDetail extends Track {}
