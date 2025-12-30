
const path = require('path');

// Configuração via ENV
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'LOCAL'; // 'LOCAL' ou 'R2'
const CDN_BASE_URL = process.env.CDN_BASE_URL || ''; // Ex: https://cdn.lomuz.com

/**
 * Gera a URL pública para um arquivo de mídia.
 * Prepara o terreno para URLs assinadas do Cloudflare no futuro.
 */
exports.resolvePublicUrl = (mediaFile) => {
    if (!mediaFile) return null;

    // Se já tiver uma CDN URL explícita no banco (migração futura), usa ela
    if (mediaFile.cdn_url) return mediaFile.cdn_url;

    // Estratégia R2 (Cloudflare)
    if (mediaFile.storage_provider === 'R2') {
        // TODO: Implementar assinatura de URL (Presigned URL) aqui para segurança
        return `${CDN_BASE_URL}/${mediaFile.bucket_key}`;
    }

    // Estratégia Local (Default Atual)
    // Assume que mediaFile.file_path é relativo a /uploads (ex: /aac/arquivo.aac)
    // Se o path já começar com http, retorna direto
    if (mediaFile.file_path.startsWith('http')) return mediaFile.file_path;
    
    // Garante formato correto
    const relativePath = mediaFile.file_path.startsWith('/') ? mediaFile.file_path : `/${mediaFile.file_path}`;
    return `/uploads${relativePath}`; // Mapeado no Express static
};

/**
 * Retorna o caminho físico (file system) para operações de transcode
 * Apenas relevante para provider LOCAL
 */
exports.getLocalPath = (mediaFile) => {
    if (mediaFile.storage_provider !== 'LOCAL') return null;
    return path.join(__dirname, '../uploads', mediaFile.file_path.replace('/uploads/', ''));
};
