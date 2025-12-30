import { Media, Playlist, DashboardStats } from '../types';

// URL da API (pode ser configurada via ENV no Vite: VITE_API_URL)
const API_BASE = 'https://api.lomuz.com/api';

const getHeaders = () => {
    // O ID da organização deve ser armazenado no login
    const orgId = localStorage.getItem('user_org_id'); 
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    if (orgId) headers['x-org-id'] = orgId;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return headers;
};

export const RealApiService = {
    
    // --- MEDIA ---
    getMedia: async (type?: string): Promise<Media[]> => {
        const query = type ? `?type=${type}` : '';
        const res = await fetch(`${API_BASE}/media${query}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Falha ao buscar mídia');
        return res.json();
    },

    // --- PLAYLISTS ---
    getPlaylists: async (): Promise<Playlist[]> => {
        const res = await fetch(`${API_BASE}/playlists`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Falha ao buscar playlists');
        return res.json();
    },

    // --- HEALTH CHECK ---
    checkHealth: async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/health`);
            return res.ok;
        } catch {
            return false;
        }
    }
    
    // Adicionar outros métodos conforme necessário, espelhando mockApi.ts
};
