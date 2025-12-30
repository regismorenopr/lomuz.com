
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. SECURITY: Force HTTPS & Canonical Host (lomuz.com)
    // Se vier HTTP ou www, redireciona para https://lomuz.com
    if (url.protocol === 'http:' || url.hostname === 'www.lomuz.com') {
      url.protocol = 'https:';
      url.hostname = 'lomuz.com';
      return Response.redirect(url.toString(), 301);
    }

    // 2. SPA ROUTING: Tenta buscar o asset estático
    let response = await env.ASSETS.fetch(request);

    // Se o asset não existir (404) e não for uma extensão de arquivo (ex: .png, .css),
    // serve o index.html para o React Router assumir (SPA Fallback).
    if (response.status === 404 && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      response = await env.ASSETS.fetch(indexRequest);
    }

    // Clonar a resposta para poder alterar headers (respostas do ASSETS são imutáveis)
    response = new Response(response.body, response);

    // 3. SECURITY HEADERS (OWASP Best Practices)
    const headers = response.headers;

    // HSTS: Força HTTPS por 1 ano
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Proteção contra MIME Sniffing
    headers.set('X-Content-Type-Options', 'nosniff');
    
    // Proteção contra Clickjacking (impede iframe em outros sites)
    headers.set('X-Frame-Options', 'DENY');
    
    // Proteção contra XSS simples
    headers.set('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy: Não vazar dados de URL para sites externos
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy: Desabilita funcionalidades sensíveis não usadas
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // Content Security Policy (CSP)
    // Permite: Self, Tailwind CDN (visto no index.html), Google Fonts, e inline styles (comum em React/Vite dev).
    // Bloqueia: Scripts externos não autorizados, objetos, iframes não autorizados.
    headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.lomuz.com; " + // Ajustar se sua API for externa
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "frame-ancestors 'none';"
    );

    // 4. CACHE CONTROL
    // Arquivos versionados do Vite (assets/*) ganham cache longo
    if (url.pathname.startsWith('/assets/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } 
    // Arquivos HTML e outros não devem ser cacheados agressivamente para permitir updates
    else if (response.headers.get('Content-Type')?.includes('text/html')) {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return response;
  }
};
