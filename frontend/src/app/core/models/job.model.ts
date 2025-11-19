export type JobStatus =
  | 'applied'
  | 'phone-screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'wishlist';

export interface Job {
  id: string;
  company: string;
  title: string;
  status: JobStatus;
  dateApplied?: string;
  nextFollowUp?: string;
  notes?: string | null;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JobInput {
  company: string;
  title: string;
  status: JobStatus;
  dateApplied?: string;
  nextFollowUp?: string;
  notes?: string | null;
  tags?: string[];
}
