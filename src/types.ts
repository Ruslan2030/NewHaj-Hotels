export type EmailStatus = 'unverified' | 'valid' | 'invalid' | 'risky' | 'checking';

export type OutreachStatus = 'not_contacted' | 'drafted' | 'sent' | 'opened' | 'replied' | 'partner_onboarded';

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  city?: string;
  email?: string;
  emailStatus: EmailStatus;
  emailMxValid?: boolean;
  website?: string;
  whatsapp?: string;
  phone?: string;
  socials: SocialLinks;
  ministryLicense?: string; // Saudi Hajj & Umrah License Number
  completenessScore: number; // 0 to 100%
  outreachStatus: OutreachStatus;
  lastEnrichedAt?: string;
  aiNotes?: string;
  lastMessageSent?: {
    type: 'email' | 'whatsapp';
    language: 'ar' | 'en' | 'ru' | 'tr' | 'id' | 'ur';
    content: string;
    sentAt: string;
  };
}

export type AgentType = 
  | 'research_enricher' 
  | 'email_verifier' 
  | 'social_finder' 
  | 'outreach_communicator' 
  | 'crm_classifier';

export interface AgentInfo {
  id: AgentType;
  name: string;
  nameRu: string;
  role: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  tasksCompleted: number;
  iconName: string;
  modelUsed: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agentId: AgentType;
  agentName: string;
  companyName: string;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface EnrichmentFilter {
  search: string;
  country: string;
  completeness: 'all' | 'incomplete' | 'complete';
  emailStatus: 'all' | 'unverified' | 'valid' | 'invalid';
  outreachStatus: 'all' | 'not_contacted' | 'sent' | 'replied';
}
