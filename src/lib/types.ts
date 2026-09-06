// ============================================================
// DESAG Election Management System — Shared TypeScript Types
// ============================================================

// ============================================================
// ENUMS
// ============================================================

export type UserRole =
  | 'super_admin'
  | 'election_admin'
  | 'returning_officer'
  | 'candidate_agent'
  | 'voter';

export type ElectionStatus =
  | 'draft'
  | 'scheduled'
  | 'open'
  | 'closed'
  | 'under_review'
  | 'awaiting_declaration'
  | 'declared'
  | 'archived';

export type AgentReviewStatus =
  | 'pending'
  | 'accepted'
  | 'objected'
  | 'no_response_deemed_accepted';

export type ObjectionStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'dismissed';

export type SmsStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export type CredentialMode = 'secure' | 'legacy';

export type VoterStatus = 'active' | 'inactive' | 'suspended';

// ============================================================
// CORE ENTITIES
// ============================================================

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Election {
  id: string;
  title: string;
  description: string | null;
  academic_year: string;
  region: string;
  election_date: string;
  voting_start_time: string;
  voting_end_time: string;
  timezone: string;
  voting_instructions: string | null;
  voting_rules: string | null;
  status: ElectionStatus;
  logo_url: string | null;
  banner_url: string | null;
  show_live_results_to_agents: boolean;
  agent_review_duration_minutes: number;
  result_published: boolean;
  election_reference: string | null;
  created_by: string | null;
  declared_by: string | null;
  declared_at: string | null;
  declaration_statement: string | null;
  result_snapshot_taken_at: string | null;
  agent_review_started_at: string | null;
  agent_review_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  election_id: string;
  name: string;
  description: string | null;
  display_order: number;
  max_selections: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  position_id: string;
  candidate_code: string | null;
  full_name: string;
  photo_url: string | null;
  biography: string | null;
  slogan: string | null;
  manifesto: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateWithPosition extends Candidate {
  position: Position;
}

export interface Voter {
  id: string;
  election_id: string;
  student_id: string;
  index_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  phone: string;
  email: string | null;
  study_centre: string | null;
  programme: string | null;
  level: string | null;
  username: string;
  credential_mode: CredentialMode;
  status: VoterStatus;
  is_eligible: boolean;
  has_voted: boolean;
  voted_at: string | null;
  credential_generated_at: string | null;
  credential_sent_at: string | null;
  credential_sent_to: string | null;
  credential_sms_status: SmsStatus | null;
  confirmation_sms_sent_at: string | null;
  confirmation_sms_status: SmsStatus | null;
  last_login_at: string | null;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateAgent {
  id: string;
  election_id: string;
  candidate_id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  username: string;
  is_active: boolean;
  review_status: AgentReviewStatus;
  review_decision_at: string | null;
  review_notified_at: string | null;
  acceptance_statement: string | null;
  digital_signature: string | null;
  device_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Ballot {
  id: string;
  election_id: string;
  ballot_token: string;
  submitted_at: string;
  is_valid: boolean;
}

export interface BallotSelection {
  id: string;
  ballot_id: string;
  position_id: string;
  candidate_id: string;
}

export interface VoterParticipation {
  id: string;
  election_id: string;
  voter_id: string;
  voted_at: string;
  confirmation_reference: string;
  session_metadata: Record<string, unknown> | null;
}

export interface ResultSnapshot {
  id: string;
  election_id: string;
  snapshot_data: ElectionResultData;
  total_registered_voters: number;
  total_votes_cast: number;
  turnout_percentage: number;
  taken_at: string;
  taken_by: string | null;
}

export interface Objection {
  id: string;
  election_id: string;
  agent_id: string;
  candidate_id: string;
  position_id: string;
  category: string;
  reason: string;
  evidence_url: string | null;
  status: ObjectionStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Declaration {
  id: string;
  election_id: string;
  declared_by: string;
  declaring_officer_name: string;
  declaration_statement: string;
  declared_at: string;
  election_reference: string | null;
  checklist_data: Record<string, boolean> | null;
}

export interface NotificationTemplate {
  id: string;
  election_id: string | null;
  name: string;
  template_key: string;
  body: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmsLog {
  id: string;
  election_id: string | null;
  recipient_name: string | null;
  recipient_phone: string;
  message_body: string;
  template_key: string | null;
  status: SmsStatus;
  provider_message_id: string | null;
  provider_response: Record<string, unknown> | null;
  sent_by: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  election_id: string | null;
  actor_id: string | null;
  actor_role: UserRole | null;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ImportBatch {
  id: string;
  election_id: string;
  filename: string;
  total_records: number;
  valid_records: number;
  imported_records: number;
  failed_records: number;
  duplicate_records: number;
  errors: ImportError[] | null;
  imported_by: string | null;
  created_at: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

// ============================================================
// COMPUTED / VIEW TYPES
// ============================================================

export interface CandidateResult {
  candidate_id: string;
  election_id: string;
  position_id: string;
  candidate_name: string;
  photo_url: string | null;
  candidate_code: string | null;
  position_name: string;
  position_order: number;
  vote_count: number;
  vote_percentage: number;
  ranking: number;
}

export interface ElectionStats {
  election_id: string;
  title: string;
  status: ElectionStatus;
  voting_start_time: string;
  voting_end_time: string;
  total_registered_voters: number;
  total_votes_cast: number;
  turnout_percentage: number;
  remaining_voters: number;
}

export interface PositionResults {
  position: Position;
  candidates: CandidateResult[];
  total_votes: number;
}

export interface ElectionResultData {
  election: Election;
  stats: ElectionStats;
  positions: PositionResults[];
  taken_at: string;
}

// ============================================================
// FORM TYPES
// ============================================================

export interface CreateElectionForm {
  title: string;
  description: string;
  academic_year: string;
  region: string;
  election_date: string;
  voting_start_time: string;
  voting_end_time: string;
  timezone: string;
  voting_instructions: string;
  voting_rules: string;
  show_live_results_to_agents: boolean;
  agent_review_duration_minutes: number;
}

export interface CreatePositionForm {
  name: string;
  description: string;
  display_order: number;
  max_selections: number;
}

export interface CreateCandidateForm {
  full_name: string;
  position_id: string;
  candidate_code: string;
  biography: string;
  slogan: string;
  manifesto: string;
  display_order: number;
}

export interface CreateVoterForm {
  student_id: string;
  index_number: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  email: string;
  study_centre: string;
  programme: string;
  level: string;
}

export interface VoterLoginForm {
  username: string;
  password: string;
}

export interface BallotSelectionMap {
  [positionId: string]: string; // position_id -> candidate_id
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface VoteSubmissionResult {
  success: boolean;
  confirmation_reference: string;
  submitted_at: string;
}

export interface ImportPreviewResult {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  errors: ImportError[];
  preview_rows: Partial<CreateVoterForm>[];
}

export interface SmsResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

// ============================================================
// SYSTEM SETTINGS TYPE
// ============================================================

export interface SystemSettings {
  organization_name: string;
  organization_short_name: string;
  organization_region: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  default_review_duration_minutes: number;
  credential_mode: CredentialMode;
  academic_year: string;
  sms_sender_id: string;
  app_url: string;
  result_url: string;
}

// ============================================================
// REALTIME PAYLOAD TYPES
// ============================================================

export interface RealtimeVoteEvent {
  election_id: string;
  position_id: string;
  candidate_id: string;
  total_votes: number;
  timestamp: string;
}

export interface RealtimeElectionStats {
  election_id: string;
  total_votes_cast: number;
  turnout_percentage: number;
  remaining_voters: number;
  votes_per_minute: number;
}
