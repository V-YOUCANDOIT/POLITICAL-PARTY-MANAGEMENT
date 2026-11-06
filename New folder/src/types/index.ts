export type UserRole =
  | 'Super Administrator'
  | 'Central Administrator'
  | 'State Coordinator'
  | 'District Coordinator'
  | 'Constituency Manager'
  | 'Campaign Manager'
  | 'Volunteer / Ground Worker';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  unit_id?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  unit?: {
    id: string;
    name: string;
    type: string;
    state_name?: string;
    district_name?: string;
  };
}

export interface OrganizationalUnit {
  id: string;
  name: string;
  type: 'Central' | 'State' | 'District' | 'Constituency' | 'Local';
  parent_id?: string;
  coordinator_id?: string;
  coordinator_name?: string;
  coordinator_email?: string;
  state_name?: string;
  district_name?: string;
  address?: string;
  member_count?: number;
  created_at?: string;
}

export type CampaignStatus = 'Draft' | 'Planned' | 'Active' | 'Paused' | 'Completed' | 'Archived';

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  objectives?: string;
  start_date: string;
  end_date: string;
  location?: string;
  status: CampaignStatus;
  manager_id?: string;
  manager_name?: string;
  budget_allocated: number;
  task_count?: number;
  completed_task_count?: number;
  member_count?: number;
  spent_amount?: number;
  created_at?: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Under Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  campaign_id: string;
  campaign_title?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  created_by_id?: string;
  created_at?: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id?: string;
  question_text: string;
  question_type: 'single' | 'mcq' | 'rating' | 'text';
  options?: string[];
  order_index?: number;
  is_required?: boolean;
  aggregated?: { answer_value: string; count: number }[];
  textResponses?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'Draft' | 'Published' | 'Closed';
  is_anonymous: number;
  created_by_id?: string;
  creator_name?: string;
  expires_at?: string;
  question_count?: number;
  response_count?: number;
  created_at?: string;
  questions?: SurveyQuestion[];
}

export interface LogisticsItem {
  id: string;
  item: string;
  done: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  category: 'Rally' | 'Town Hall' | 'Convention' | 'Volunteer Training' | 'Press Conference' | 'Fundraiser' | 'Community Outreach';
  date_time: string;
  venue: string;
  coordinator_id?: string;
  coordinator_name?: string;
  expected_attendance: number;
  actual_attendance: number;
  budget: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  logistics_checklist: LogisticsItem[];
  participant_count?: number;
  created_at?: string;
}

export interface Expense {
  id: string;
  campaign_id?: string;
  campaign_title?: string;
  budget_id?: string;
  budget_title?: string;
  title: string;
  description?: string;
  category: 'Travel' | 'Media & Advertising' | 'Venue & Rentals' | 'Printing & Materials' | 'Catering' | 'Logistics' | 'Miscellaneous';
  amount: number;
  transaction_date: string;
  receipt_url?: string;
  submitted_by_id: string;
  submitter_name?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approval_notes?: string;
  reviewed_by_id?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_type: 'All' | 'Department' | 'Unit' | 'Volunteers';
  target_id?: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  author_id: string;
  author_name: string;
  author_role: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'expense' | 'survey' | 'announcement' | 'system';
  link?: string;
  is_read: number;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
