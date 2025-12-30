
export enum UserRole {
  MASTER = 'MASTER', 
  DIRECTOR = 'DIRECTOR',
  CLIENT = 'CLIENT',
}

export enum PlanTier {
  ESSENTIAL = 'ESSENTIAL',
  BUSINESS = 'BUSINESS',
  MARKETING_PLUS = 'MARKETING_PLUS',
}

export enum SovereigntyScope {
  SPECIFIC = 'SPECIFIC',
  SEGMENT = 'SEGMENT',
  NETWORK = 'NETWORK',
}

export enum MediaType {
  MUSIC = 'MUSIC',
  AD = 'AD',
  VIGNETTE = 'VIGNETTE',
}

export enum ClientType {
  RADIO = 'RADIO',
  STORE = 'STORE',
}

// --- NOVAS INTERFACES DE GOVERNANÇA ---

export interface DSPConfig {
  masterVolume: number;
  musicGain: number;
  spokenGain: number;
  bitrate: 32 | 48 | 64 | 96 | 128;
  normalizationEnabled: boolean;
  compressionEnabled: boolean;
  fadesEnabled: boolean;
  mixing: {
    m2m: number; // Music to Music
    s2m: number; // Spot to Music
    m2s: number; // Music to Spot
    s2s: number; // Spot to Spot
  };
}

export interface ClientControls {
  canManageAds: boolean;
  canManageScheduling: boolean;
  canManageCuration: boolean;
  canAccessAdvancedAudio: boolean;
  canUseIAVoice: boolean;
  canUploadMedia: boolean;
}

export interface NetworkSpot {
  id: string;
  label: string;
  isActive: boolean;
  clientManaged: boolean;
}

export interface SovereigntyJob {
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  progress: number;
  targetCount: number;
}

// --- INTERFACES EXISTENTES ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan?: PlanTier;
  avatarUrl?: string;
  company?: string;
  active?: boolean;
  publicId?: string;
  createdAt?: string;
}

export interface RadioPermissions {
  canEditVolumes: boolean;
  canEditDSP: boolean;
  canRequestAds: boolean;
  canManagePlaylists: boolean;
  canChangeBitrate: boolean;
}

export interface Radio {
  id: string;
  name: string;
  type: string | ClientType;
  status: 'ONLINE' | 'OFFLINE' | 'ALERT';
  companyName: string;
  city: string;
  bitrate: number;
  permissions: RadioPermissions;
  sessionLimit?: number;
}

export interface Genre {
  id: string;
  name: string;
  mediaCount: number;
  active: boolean;
  description?: string;
}

export interface Media {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  audioUrl: string;
  genreIds: string[];
  type: MediaType;
  uploadedAt: string;
  uploadedBy?: string;
  blocks?: {
    global?: boolean;
  };
}

export interface Playlist {
  id: string;
  name: string;
  mediaCount: number;
  genreIds: string[];
  suggestedSegments?: string[];
  media?: Media[];
  description?: string;
}

export interface SelectedItem {
  id: string;
  name: string;
}

export interface DashboardStats {
  totalClients: number;
  activeRadios: number;
  activeSessions: number;
  storageUsedPercent: number;
}

export interface GrowthData {
  date: string;
  newClients: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  companyName?: string;
  phone?: string;
  acceptedTerms: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  company?: string;
}

export interface ClientPreference {
  musicVolume: number;
  mediaVolume: number;
}

export interface ReliabilityReport {
  uptimePercent: number;
  totalProgrammed: number;
  successCount: number;
  failCount: number;
  recurringFailures: {
    mediaTitle: string;
    lastReason: string;
    count: number;
  }[];
  failureBreakdown: {
    network: number;
    corrupted: number;
    conflict: number;
  };
}

export interface AdRequest {
  id: string;
  radioId: string;
  type: 'VIRTUAL' | 'PRO';
  status: string;
  textOriginal: string;
  textFinal: string;
  createdAt: string;
  voiceId?: string;
  aiFeedback?: string;
}

export interface WizardPayload {
  radio: {
    name: string;
    slug: string;
    segment: string;
    initialPlaylistId: string;
  };
  selectedPlaylists: string[];
  attractions: Record<string, any>;
  dadosCadastrais: any;
}

export interface WizardResponse {
  success: boolean;
  radioId: string;
  linkRadio: string;
  activationToken: string;
}

export type VirtualVoiceId = 'male_1' | 'male_2' | 'male_3' | 'female_1' | 'female_2' | 'child_1';

export interface AuditLog {
  u: string;
  a: string;
  t: string;
}

export interface RadioSettings {
  music_volume: number;
  media_volume: number;
  bitrate: number;
  weather_city?: string;
  volume_normalizer_enabled?: boolean;
}

export interface ManifestItem {
  media_id: string;
  src: string;
  title: string;
  type: 'MUSIC' | 'AD' | 'VIGNETTE';
  duration: number;
  hash: string;
}

export interface AudioManifest {
  stream_id: string;
  config: {
    crossfade: number;
    normalization_lufs: number;
    bitrate_target: number;
  };
  queue: ManifestItem[];
}
