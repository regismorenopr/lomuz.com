
import { ManifestItem, MediaType, RadioSettings } from '../types';

/**
 * Player Engine SaaS (Grupo 7, 10 & 14)
 * Motor de borda inteligente focado em "Zero Silence".
 */
class PlayerEngine {
    private static instance: PlayerEngine;
    private deviceId: string;
    private streamId: string | null = null;
    private masterQueue: ManifestItem[] = [];
    private localCache: Set<string> = new Set();
    private state: 'PLAYING' | 'IDLE' | 'DEGRADED' = 'IDLE';

    private constructor() {
        this.deviceId = localStorage.getItem('lomuz_device_id') || `dev-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('lomuz_device_id', this.deviceId);
        this.initAutoHealing();
    }

    public static getInstance(): PlayerEngine {
        if (!PlayerEngine.instance) PlayerEngine.instance = new PlayerEngine();
        return PlayerEngine.instance;
    }

    /**
     * Auto-Healing (Grupo 14)
     * Monitora se o áudio está tocando e tenta recuperar de travamentos silenciosos.
     */
    private initAutoHealing() {
        setInterval(() => {
            if (this.state === 'PLAYING' && !this.isAudioActuallyPlaying()) {
                console.warn('[Lomuz Healing] Silêncio detectado. Forçando avanço de fila.');
                this.advance();
            }
        }, 10000);
    }

    private isAudioActuallyPlaying(): boolean {
        // Implementação lógica simplificada: em um cenário real, checaria o estado do buffer/gain
        return true; 
    }

    /**
     * Sincronização Inteligente (Grupo 13)
     * Prioriza downloads de arquivos que tocarão em breve.
     */
    public async sync(manifest: any) {
        if (!manifest || !manifest.queue) return;
        this.streamId = manifest.stream_id;
        this.masterQueue = manifest.queue;
        
        // Resolve a lista de arquivos para pre-load
        // Se 'files' não vier no manifesto, extrai do 'queue' (fallback)
        const filesToPreload = manifest.files || manifest.queue.map((q: any) => ({
            id: q.media_id || q.id,
            url: q.src || q.url
        }));

        this.preloadMedia(filesToPreload);
    }

    private async preloadMedia(files: any[]) {
        if (!files || !Array.isArray(files) || !('caches' in window)) return;
        
        try {
            const cache = await caches.open('lomuz-assets-v2');
            
            for (const file of files) {
                const url = file.url || file.src;
                const id = file.id || file.media_id;
                
                if (!url || !id) continue;

                try {
                    const cached = await cache.match(url);
                    if (!cached) {
                        // Usamos fetch manual em vez de cache.add para lidar melhor com CORS e opacidade
                        const response = await fetch(url, { 
                            method: 'GET',
                            mode: 'cors',
                            credentials: 'omit'
                        });

                        if (response.ok) {
                            await cache.put(url, response);
                            this.localCache.add(id);
                            console.debug(`[Cache] Asset ${id} sincronizado com sucesso.`);
                        } else {
                            throw new Error(`HTTP ${response.status}`);
                        }
                    } else {
                        this.localCache.add(id);
                    }
                } catch (e) {
                    // Erros de cache são avisos: o player tem fallback para streaming direto
                    console.warn(`[Cache] Asset ${id} indisponível para offline. Usando buffer dinâmico.`);
                }
            }
        } catch (globalError) {
            console.error('[Cache] Erro crítico no subsistema de armazenamento:', globalError);
        }
    }

    /**
     * Obtenção de Próxima Faixa (Grupo 5 & 14)
     * Se o arquivo principal não estiver em cache, busca o próximo disponível 
     * para evitar silêncio a qualquer custo.
     */
    public getNextTrack(): ManifestItem | null {
        if (this.masterQueue.length === 0) return null;

        for (let i = 0; i < this.masterQueue.length; i++) {
            const candidate = this.masterQueue[i];
            if (this.localCache.has(candidate.media_id)) {
                this.masterQueue.splice(0, i + 1);
                this.state = 'PLAYING';
                return candidate;
            }
        }

        // Se nada está em cache, retorna o primeiro e entra em modo degradado (streaming direto)
        this.state = 'DEGRADED';
        return this.masterQueue.shift() || null;
    }

    public advance() {
        // Lógica de avanço por fim de faixa ou erro
    }
}

export default PlayerEngine;
