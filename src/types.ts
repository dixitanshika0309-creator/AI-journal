export type ReflectionMode = 'reflection' | 'brainstorm' | 'summary' | 'deep_dive' | 'action_plan';

export type UserRole = 'admin' | 'editor' | 'member';

export interface JournalLocation {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string;
  mapUrl?: string;
  category?: string;
}

export interface JournalTurn {
  id: string;
  role: 'user' | 'gemini';
  content: string;
  timestamp: number;
  mode?: ReflectionMode;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mood?: string;
  tags?: string[];
  location?: JournalLocation;
  turns: JournalTurn[];
  summary?: string;
  keyTakeaways?: string[];
  actionItems?: string[];
  isFavorite?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  createdAt?: number;
  lastLogin?: number;
  entryCount?: number;
}

export interface ReflectionRequestPayload {
  prompt: string;
  mode: ReflectionMode;
  contextHistory?: Array<{
    role: 'user' | 'model';
    text: string;
  }>;
  currentTitle?: string;
}

export interface ReflectionResponsePayload {
  reply: string;
  suggestedTitle?: string;
  keyTakeaways?: string[];
  actionItems?: string[];
  moodTag?: string;
  detectedTags?: string[];
  error?: string;
  modelUsed?: string;
}

export interface AdminTelemetry {
  totalEntries: number;
  totalReflections: number;
  activeUsers: number;
  avgLatencyMs: number;
  errorRatePct: number;
  modelDistribution: {
    'gemini-3.6-flash': number;
    'gemini-3.1-flash-lite': number;
    'gemini-3.7-flash': number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface WebhookConfig {
  url: string;
  platform: 'slack' | 'discord' | 'custom' | 'email';
  enabled: boolean;
  notifyOnMilestones: boolean;
  notifyOnActionPlans: boolean;
  notifyOnDailyReflect: boolean;
  lastDispatchedAt?: number;
  lastStatus?: number;
}

