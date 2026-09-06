-- ============================================================
-- DESAG Election Management System — Seed / Demo Data
-- Run ONLY in development environments
-- ============================================================

-- ============================================================
-- DEFAULT SYSTEM SETTINGS
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
('organization_name', '"Distance Education Students'' Association of Ghana"', 'Organization full name'),
('organization_short_name', '"DESAG"', 'Organization short name'),
('organization_region', '"Central Region"', 'Operating region'),
('primary_color', '"#1e3a8a"', 'Primary brand color (deep blue)'),
('secondary_color', '"#dc2626"', 'Secondary brand color (red)'),
('accent_color', '"#d97706"', 'Accent brand color (golden yellow)'),
('default_review_duration_minutes', '30', 'Default candidate agent review period'),
('credential_mode', '"secure"', 'Default credential generation mode'),
('academic_year', '"2025/2026"', 'Current academic year'),
('sms_sender_id', '"DESAG"', 'SMS sender name'),
('app_url', '"https://vote.desagcr.org"', 'Voting portal URL'),
('result_url', '"https://vote.desagcr.org/results"', 'Public results URL')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- DEFAULT NOTIFICATION TEMPLATES
-- ============================================================
INSERT INTO notification_templates (name, template_key, body, is_global) VALUES
(
  'Voter Credentials',
  'voter_credentials',
  'Dear {{first_name}}, your voting credentials for the {{election_name}} election are ready. Visit {{voting_url}} to cast your vote. Username: {{username}}. Code: {{credential}}. Voting: {{opening_time}} - {{closing_time}}. This credential is for your use only.',
  true
),
(
  'Election Opening',
  'election_opening',
  'Dear {{first_name}}, voting for the {{election_name}} is NOW OPEN! Visit {{voting_url}} to vote. Username: {{username}}. Voting closes at {{closing_time}}. Every vote counts!',
  true
),
(
  'Voting Reminder',
  'voting_reminder',
  'Dear {{first_name}}, friendly reminder: voting for {{election_name}} closes at {{closing_time}}. You have not yet voted. Cast your vote at {{voting_url}}. Username: {{username}}.',
  true
),
(
  'Vote Confirmation',
  'vote_confirmation',
  'Dear {{first_name}}, your vote in the {{election_name}} has been successfully recorded. Reference: {{confirmation_reference}}. Thank you for participating!',
  true
),
(
  'Agent Result Review',
  'agent_review_invitation',
  'Dear {{agent_name}}, voting for the {{election_name}} has closed. You are invited to review the results for {{candidate_name}} ({{position_name}}). Log in at {{app_url}}/agent/review. Review deadline: {{deadline}}.',
  true
),
(
  'Official Result Announcement',
  'result_announcement',
  'DESAG {{election_name}} Results have been officially declared. {{results_summary}} View full results at {{result_url}}.',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEMO: Create a sample Super Admin profile
-- (Link to auth.users via Supabase dashboard or auth API)
-- The following creates a placeholder for the super admin profile.
-- In production, create the auth user first, then this profile will
-- be auto-created via trigger. Run this only to set the role.
-- ============================================================

-- Note: In production, after creating the admin via Supabase Auth,
-- run: UPDATE profiles SET role = 'super_admin' WHERE email = 'admin@desagcr.org';

-- ============================================================
-- DEMO ELECTION (for testing)
-- ============================================================
DO $$
DECLARE
  v_election_id UUID := uuid_generate_v4();
  v_president_id UUID := uuid_generate_v4();
  v_vp_id UUID := uuid_generate_v4();
  v_secretary_id UUID := uuid_generate_v4();
  v_treasurer_id UUID := uuid_generate_v4();
  v_women_id UUID := uuid_generate_v4();
  v_pro_id UUID := uuid_generate_v4();
  v_cand1 UUID := uuid_generate_v4();
  v_cand2 UUID := uuid_generate_v4();
  v_cand3 UUID := uuid_generate_v4();
  v_cand4 UUID := uuid_generate_v4();
  v_cand5 UUID := uuid_generate_v4();
  v_cand6 UUID := uuid_generate_v4();
  v_cand7 UUID := uuid_generate_v4();
  v_cand8 UUID := uuid_generate_v4();
BEGIN

-- Sample Election
INSERT INTO elections (
  id, title, description, academic_year, region, election_date,
  voting_start_time, voting_end_time, timezone, status,
  voting_instructions, voting_rules, show_live_results_to_agents,
  agent_review_duration_minutes, election_reference
) VALUES (
  v_election_id,
  'DESAG Central Region Executive Elections 2025/2026',
  'Annual elections for the executive leadership of the Distance Education Students'' Association of Ghana, Central Region.',
  '2025/2026',
  'Central Region',
  '2026-09-15',
  '2026-09-15 08:00:00+00',
  '2026-09-15 17:00:00+00',
  'Africa/Accra',
  'scheduled',
  'Please vote for ONE candidate for each position. Review your selections carefully before submitting. Once submitted, your ballot cannot be changed.',
  '1. Each eligible student may vote only once. 2. Voting is private and anonymous. 3. Results will be declared after the candidate review period.',
  false,
  30,
  'DESAG-CR-2026-001'
);

-- Positions
INSERT INTO positions (id, election_id, name, description, display_order) VALUES
  (v_president_id, v_election_id, 'President', 'The overall leader of DESAG Central Region', 1),
  (v_vp_id, v_election_id, 'Vice President', 'Deputy leader of DESAG Central Region', 2),
  (v_secretary_id, v_election_id, 'General Secretary', 'Secretary to the DESAG Central Region executive', 3),
  (v_treasurer_id, v_election_id, 'Treasurer', 'Financial officer of DESAG Central Region', 4),
  (v_women_id, v_election_id, 'Women''s Commissioner', 'Representative for women students', 5),
  (v_pro_id, v_election_id, 'Public Relations Officer', 'Communications officer', 6);

-- Candidates for President
INSERT INTO candidates (id, election_id, position_id, candidate_code, full_name, slogan, biography, display_order) VALUES
  (v_cand1, v_election_id, v_president_id, 'P01', 'Kwame Asante Mensah', 'Excellence Through Service', 'Level 400 student in Business Administration at UCC. Former SRC representative.', 1),
  (v_cand2, v_election_id, v_president_id, 'P02', 'Abena Osei Bonsu', 'Together We Rise', 'Level 300 student in Education. Active member of women''s committee.', 2);

-- Candidates for VP
INSERT INTO candidates (id, election_id, position_id, candidate_code, full_name, slogan, biography, display_order) VALUES
  (v_cand3, v_election_id, v_vp_id, 'VP01', 'Kofi Boateng Amponsah', 'A New Direction', 'Level 300 Economics student with strong organizational skills.', 1),
  (v_cand4, v_election_id, v_vp_id, 'VP02', 'Ama Owusu Darko', 'Strength in Unity', 'Level 400 Sociology student and community leader.', 2);

-- Candidates for General Secretary
INSERT INTO candidates (id, election_id, position_id, candidate_code, full_name, slogan, biography, display_order) VALUES
  (v_cand5, v_election_id, v_secretary_id, 'GS01', 'Emmanuel Amoah Quansah', 'Accountability First', 'Level 300 student with administrative experience.', 1),
  (v_cand6, v_election_id, v_secretary_id, 'GS02', 'Yaa Acheampong', 'Transparency and Service', 'Level 400 student who has served as class secretary for 3 years.', 2);

-- Candidates for Treasurer
INSERT INTO candidates (id, election_id, position_id, candidate_code, full_name, slogan, biography, display_order) VALUES
  (v_cand7, v_election_id, v_treasurer_id, 'TR01', 'Francis Adjei Asante', 'Sound Financial Management', 'Level 300 Accounting student.', 1),
  (v_cand8, v_election_id, v_treasurer_id, 'TR02', 'Adwoa Frimpong Gyasi', 'Your Finances, Our Priority', 'Level 400 Finance student.', 2);

-- Demo Voters (password_hash = bcrypt of "demo@2026" for testing)
-- In production, generate real credentials via the admin panel
INSERT INTO voters (
  election_id, student_id, first_name, last_name, phone, username,
  password_hash, credential_mode, status, is_eligible
) VALUES
  (v_election_id, 'STU001', 'Valentine', 'Awunyo', '+233244000001', 'valentine.awunyo',
   crypt('demo@2026', gen_salt('bf', 12)), 'secure', 'active', true),
  (v_election_id, 'STU002', 'Akosua', 'Mensah', '+233244000002', 'akosua.mensah',
   crypt('demo@2026', gen_salt('bf', 12)), 'secure', 'active', true),
  (v_election_id, 'STU003', 'Kwabena', 'Boateng', '+233244000003', 'kwabena.boateng',
   crypt('demo@2026', gen_salt('bf', 12)), 'secure', 'active', true),
  (v_election_id, 'STU004', 'Ama', 'Asante', '+233244000004', 'ama.asante',
   crypt('demo@2026', gen_salt('bf', 12)), 'secure', 'active', true),
  (v_election_id, 'STU005', 'Kofi', 'Antwi', '+233244000005', 'kofi.antwi',
   crypt('demo@2026', gen_salt('bf', 12)), 'secure', 'active', true);

END $$;
