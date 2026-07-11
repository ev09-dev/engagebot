// Database schema types for EngageBot

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: 'instagram' | 'tiktok';
  platform_user_id: string;
  platform_username: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  platform: 'instagram' | 'tiktok';
  platform_post_id: string;
  caption?: string;
  media_url?: string;
  post_url: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  platform: 'instagram' | 'tiktok';
  platform_comment_id: string;
  author_username: string;
  author_profile_pic?: string;
  content: string;
  is_spam: boolean;
  relevance_score: number;
  created_at: string;
  updated_at: string;
}

export interface Response {
  id: string;
  user_id: string;
  comment_id: string;
  content: string;
  is_ai_generated: boolean;
  is_approved: boolean;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToneProfile {
  id: string;
  user_id: string;
  adjectives: string[];
  example_responses: string[];
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  id: string;
  user_id: string;
  comments_processed: number;
  responses_generated: number;
  responses_sent: number;
  date: string;
  created_at: string;
}

export interface AutomationSettings {
  id: string;
  user_id: string;
  welcome_dm_enabled: boolean;
  welcome_dm_message?: string;
  weekly_report_enabled: boolean;
  created_at: string;
  updated_at: string;
}