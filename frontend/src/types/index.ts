export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  streak: number;
  total_interviews: number;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: "technical" | "behavioral" | "hr" | "situational";
  order_num: number;
  answer_text?: string;
  score: number;
  feedback?: string;
  accuracy_score: number;
  clarity_score: number;
  depth_score: number;
  communication_score: number;
}

export interface Interview {
  id: number;
  role: string;
  difficulty: string;
  num_questions: number;
  status: "in_progress" | "completed";
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  clarity_score: number;
  depth_score: number;
  strengths: string[];
  weaknesses: string[];
  missed_concepts: string[];
  recommended_topics: string[];
  improvement_plan?: string;
  resume_used: boolean;
  duration_seconds: number;
  created_at: string;
  completed_at?: string;
  questions: Question[];
}

export interface AnalyticsSummary {
  total_interviews: number;
  average_score: number;
  technical_score: number;
  communication_score: number;
  improvement_trend: number;
  interviews_this_week: number;
  best_score: number;
  success_rate: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  full_name?: string;
  total_interviews: number;
  average_score: number;
  streak: number;
  best_score: number;
  achievements: number;
}

export interface CoachPlan {
  weekly_plan: WeeklyDay[];
  recommended_skills: string[];
  learning_roadmap: RoadmapPhase[];
  preparation_strategy: string;
  generated_at: string;
}

export interface WeeklyDay {
  day: string;
  tasks: string[];
  duration: string;
  focus: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  topics: string[];
  resources: string[];
}

export type Role =
  | "Software Engineer"
  | "AI Engineer"
  | "Data Scientist"
  | "Frontend Developer"
  | "Backend Developer";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type QuestionCount = 5 | 10 | 20;
