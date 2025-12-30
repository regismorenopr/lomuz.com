
import { 
  Radio, ClientType, Playlist, Genre, User, UserRole, SelectedItem, 
  Media, MediaType, DashboardStats, GrowthData, PlanDistribution, 
  RegisterPayload, CreateUserPayload, ClientPreference, ReliabilityReport,
  AdRequest
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  getWeather: async (city: string): Promise<{ temp: number; condition: string }> => {
    await delay(300);
    const mockTemps: Record<string, number> = { 'São Paulo': 24, 'Curitiba': 18, 'Rio de Janeiro': 32 };
    return { 
      temp: mockTemps[city] || 22, 
      condition: 'sunny' 
    };
  },

  getClients: async (): Promise<Radio[]> => {
    await delay(400);
    return [
      { 
        id: 'c1', name: 'Rádio Lomuz Prime', type: ClientType.RADIO, status: 'ONLINE', companyName: 'Lomuz Media', city: 'São Paulo',
        bitrate: 128,
        permissions: { canEditVolumes: true, canEditDSP: true, canRequestAds: true, canManagePlaylists: true, canChangeBitrate: true }
      },
      { 
        id: 'c2', name: 'Supermercado Alpha', type: ClientType.STORE, status: 'ONLINE', companyName: 'Alpha Group', city: 'Curitiba',
        bitrate: 48,
        permissions: { canEditVolumes: true, canEditDSP: false, canRequestAds: true, canManagePlaylists: false, canChangeBitrate: false }
      },
    ];
  },

  getPlaylists: async (): Promise<Playlist[]> => {
    await delay(300);
    return [
      { id: 'p1', name: 'Varejo Premium - Hits', mediaCount: 120, genreIds: ['g1'], suggestedSegments: ['Comercial', 'Loja'] },
      { id: 'p2', name: 'Lounge Sophisticated', mediaCount: 85, genreIds: ['g2'], suggestedSegments: ['Hotelaria'] },
    ];
  },

  getAttractions: async () => {
    await delay(200);
    return [
      { id: 'at1', name: 'Hora Certa', desc: 'Informa a hora a cada 30min.' },
      { id: 'at2', name: 'Curiosidades Musicais', desc: 'Fatos sobre artistas famosos.' },
      { id: 'at3', name: 'Previsão do Tempo', desc: 'Temperatura local automática.' },
    ];
  },

  uploadMedia: async (file: File, genres: string[], duration: number, type: string): Promise<Media> => {
    await delay(500);
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: file.name,
      duration: duration || 180,
      audioUrl: URL.createObjectURL(file),
      genreIds: genres,
      type: type as MediaType,
      uploadedAt: new Date().toISOString()
    };
  },

  getMedia: async (): Promise<Media[]> => {
    await delay(400);
    return [
      { id: 'm1', title: 'Vibe Low-Fi', artist: 'Lomuz Studio', duration: 180, audioUrl: '', genreIds: ['g1'], type: MediaType.MUSIC, uploadedAt: '2023-10-01' },
      { id: 'm2', title: 'Energia Varejo', artist: 'Lomuz Studio', duration: 210, audioUrl: '', genreIds: ['g1'], type: MediaType.MUSIC, uploadedAt: '2023-10-02' },
    ];
  },

  getGenres: async (): Promise<Genre[]> => {
    await delay(300);
    return [
      { id: 'g1', name: 'Pop Varejo', mediaCount: 45, active: true },
      { id: 'g2', name: 'Lounge Sophisticated', mediaCount: 32, active: true },
    ];
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(300);
    return { totalClients: 120, activeRadios: 85, activeSessions: 450, storageUsedPercent: 65 };
  },

  getGrowthData: async (): Promise<GrowthData[]> => {
    await delay(200);
    return [
      { date: '2023-10-01', newClients: 2 },
      { date: '2023-10-02', newClients: 5 },
      { date: '2023-10-07', newClients: 9 },
    ];
  },

  getPlanDistribution: async (): Promise<PlanDistribution[]> => {
    await delay(200);
    return [
      { plan: 'Lomuz Basic', count: 50 },
      { plan: 'Lomuz Pro', count: 40 },
      { plan: 'Lomuz Enterprise', count: 30 }
    ];
  },

  registerDirector: async (payload: RegisterPayload) => {
    await delay(500);
    return { user: { email: payload.email, name: payload.fullName } };
  },

  getUsers: async (): Promise<User[]> => {
    await delay(300);
    return [
      { id: 'u1', name: 'Diretor Geral', email: 'diretor@lomuz.com', role: UserRole.DIRECTOR, company: 'Lomuz Media' },
    ];
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    await delay(400);
    return { 
      id: Math.random().toString(36).substr(2, 9), 
      name: payload.name, 
      email: payload.email, 
      role: payload.role, 
      company: payload.company,
      publicId: 'CLI-' + Math.floor(Math.random() * 1000)
    };
  },

  getAdRequests: async (radioId: string): Promise<AdRequest[]> => {
    await delay(300);
    return [
        { 
          id: 'req-1', radioId, type: 'VIRTUAL', status: 'DELIVERED', 
          textOriginal: 'Promoção de natal', textFinal: 'Confira as promoções de natal!', 
          createdAt: new Date().toISOString() 
        }
    ];
  },

  aiReviewAd: async (text: string) => {
    await delay(800);
    return { 
      suggestion: `📢 ATENÇÃO! ${text} \n\nVenha conferir agora mesmo!`, 
      reason: 'Adicionei gatilhos de urgência.' 
    };
  },

  getClientPreferences: async (clientId: string): Promise<ClientPreference> => {
    await delay(300);
    return { musicVolume: 85, mediaVolume: 95 };
  },

  getReliabilityReport: async (clientId: string): Promise<ReliabilityReport> => {
    await delay(400);
    return {
      uptimePercent: 99.9,
      totalProgrammed: 1450,
      successCount: 1428,
      failCount: 22,
      recurringFailures: [],
      failureBreakdown: { network: 12, corrupted: 6, conflict: 4 }
    };
  },

  updateMedia: async (id: string, updates: Partial<Media>): Promise<void> => {
    await delay(300);
    console.log(`[MockAPI] Media updated: ${id}`, updates);
  },

  addGenre: async (payload: { name: string; active: boolean; description?: string }): Promise<Genre> => {
    await delay(300);
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: payload.name,
      mediaCount: 0,
      active: payload.active,
      description: payload.description
    };
  },

  updatePlaylist: async (id: string, updates: Partial<Playlist>): Promise<void> => {
    await delay(300);
    console.log(`[MockAPI] Playlist updated: ${id}`, updates);
  },

  addPlaylist: async (payload: Partial<Playlist>): Promise<Playlist> => {
    await delay(400);
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: payload.name || 'Nova Playlist',
      mediaCount: payload.mediaCount || 0,
      genreIds: payload.genreIds || [],
      media: payload.media || [],
      description: payload.description
    };
  },

  deleteMedia: async (id: string): Promise<void> => {
    await delay(300);
    console.log(`[MockAPI] Media deleted: ${id}`);
  },

  deleteUser: async (id: string): Promise<void> => {
    await delay(300);
    console.log(`[MockAPI] User deleted: ${id}`);
  },

  createAdRequest: async (payload: any): Promise<AdRequest> => {
    await delay(500);
    return {
        id: 'req-' + Math.random().toString(36).substr(2, 9),
        radioId: payload.radioId,
        type: payload.type,
        status: 'REQUESTED',
        textOriginal: payload.textOriginal,
        textFinal: payload.textFinal,
        createdAt: new Date().toISOString(),
        voiceId: payload.voiceId,
        aiFeedback: payload.aiFeedback
    };
  }
};
