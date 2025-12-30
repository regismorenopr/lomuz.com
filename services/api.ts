import { Radio, User, UserRole, WizardResponse } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://api.lomuz.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('lomuz_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export interface StreamFullResponse {
  streamId: string;
  playerUrl: string;
  rtmp_url: string;
  stream_key: string;
}

export interface PlayerDataResponse {
  id: string;
  status: string;
  hls_url: string;
  name: string;
}

export const api = {
  auth: {
    login: async (email: string, pass: string): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (!res.ok) throw new Error('Falha na autenticação');
      const data = await res.json();
      localStorage.setItem('lomuz_token', data.token);
      return data.user;
    }
  },

  radios: {
    list: async (): Promise<Radio[]> => {
      const res = await fetch(`${API_BASE}/v1/streams/radios`, { headers: getHeaders() });
      const data = await res.json();
      return data.map((r: any) => ({
        id: r.id,
        name: r.stream_name,
        companyName: r.company_id,
        status: r.status,
        city: r.city || 'São Paulo',
        bitrate: r.kbps || 128,
        slug: r.id,
        permissions: { canEditVolumes: true, canRequestAds: true }
      }));
    },

    getStreamById: async (id: string): Promise<PlayerDataResponse> => {
      const res = await fetch(`${API_BASE}/v1/streams/${id}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Streaming não encontrado');
      return res.json();
    },

    // Apenas cria a rádio (DRAFT)
    createRadioSimple: async (payload: any): Promise<{ id: string }> => {
        const res = await fetch(`${API_BASE}/v1/streams`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            name: payload.name || payload.radio?.name,
            segment: payload.segment || payload.radio?.segment
          })
        });
        if (!res.ok) throw new Error('Erro ao criar streaming');
        return res.json();
    },

    // Lança o streaming (READY)
    launchStream: async (id: string): Promise<StreamFullResponse> => {
        const res = await fetch(`${API_BASE}/v1/streams/${id}/launch`, {
          method: 'POST',
          headers: getHeaders()
        });
        if (!res.ok) throw new Error('Erro ao lançar streaming');
        return res.json();
    },

    // Método legado/agregado para manter compatibilidade se necessário
    createRadioFull: async (payload: any): Promise<StreamFullResponse> => {
      const { id } = await api.radios.createSimple(payload);
      return api.radios.launchStream(id);
    },

    // Aliases para os nomes usados no wizard
    createSimple: async (payload: any) => api.radios.createRadioSimple(payload)
  }
};
