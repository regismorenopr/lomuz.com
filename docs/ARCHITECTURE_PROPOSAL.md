# Proposta de Arquitetura: Lomuz Offline-First & High Availability

Este documento detalha a arquitetura técnica para transformar o sistema Lomuz em uma solução de **Alta Disponibilidade (HA)** com operação **Offline-First**, focada em robustez e redução de custos.

---

## 1. Visão Geral

A solução baseia-se no desacoplamento total entre a **gestão** (Painel do Diretor) e a **execução** (Player do Cliente). O Player opera como uma "unidade autônoma inteligente", que sincroniza regras e arquivos quando há internet, mas executa toda a lógica de negócio localmente (na borda).

### Pilares
*   **Backend Stateless:** API sem estado de sessão, permitindo escalabilidade horizontal imediata.
*   **Borda Inteligente (Smart Edge):** O Player decide o que tocar, não o servidor.
*   **Sync Diferencial:** Tráfego de dados minimizado enviando apenas o que mudou (delta).

---

## 2. Arquitetura em Nuvem (Exemplo AWS)

A infraestrutura deve ser **Multi-AZ (Múltiplas Zonas de Disponibilidade)**, distribuída em pelo menos 3 zonas para garantir SLA de 99.99%.

### 2.1. Componentes

1.  **Frontend (Painel Web)**
    *   **S3 + CloudFront:** Hospedagem estática do React App.
    *   **Benefício:** Custo próximo de zero, latência global mínima.

2.  **API Backend (Controle)**
    *   **ECS Fargate (Containers):** Microsserviços Node.js/Go.
    *   **Application Load Balancer (ALB):** Distribui tráfego entre as zonas.
    *   **Auto Scaling:** Escala de 2 a 100 containers baseado em CPU/Requests.

3.  **Banco de Dados**
    *   **Amazon Aurora PostgreSQL:**
        *   1 Instância **Writer** (Gravação).
        *   2+ Instâncias **Readers** (Leitura) em AZs diferentes.
        *   **Failover:** Se o Writer cair, um Reader assume em < 30s.

4.  **Armazenamento de Mídia**
    *   **S3 Intelligent-Tiering:** Armazena os arquivos "Master" (MP3/FLAC) e "Transcoded" (AAC).
    *   **CloudFront (CDN):** Entrega os arquivos para os players.
        *   *Cache Policy:* `Immutable` (1 ano). O player nunca baixa o mesmo arquivo duas vezes.

### 2.2. Tolerância a Falhas (Cenários)
*   **Zona cai:** O ALB remove alvos da zona morta. O sistema continua operando com 66% da capacidade.
*   **Região cai (DR):** Rota DNS (Route53) vira para a região de Standby (ex: SP -> Virgínia).

---

## 3. Lógica Offline-First no Cliente (Player)

O player **não faz streaming contínuo**. Ele faz "Download & Play".

### 3.1. Ciclo de Vida do Player
1.  **Boot:** Verifica integridade do banco local e arquivos.
2.  **Sync (Cron 10min):**
    *   Envia `last_sync_hash` para a API.
    *   Recebe `SyncManifest` (JSON leve) com instruções: `downloads`, `deletes`, `updates`.
3.  **Download Manager:**
    *   Baixa arquivos em background com prioridade (Playlist Atual > Emergência > Futuro).
    *   Valida Hash (MD5) após download.

### 3.2. Algoritmo de Reprodução (Pseudocódigo)

```javascript
function ObterProximaMusica() {
  NOW = Date.now();

  // 1. Limpeza Lógica
  // Ignora arquivos vencidos ou arquivos deletados fisicamente
  LocalDB.exec("UPDATE assets SET status='EXPIRED' WHERE valid_until < ?", [NOW]);

  // 2. Tentativa Principal (Playlist Agendada)
  track = LocalDB.query(`
      SELECT * FROM assets 
      WHERE playlist_id = ? 
      AND valid_from <= ? AND valid_until >= ?
      AND local_file_exists = 1
      ORDER BY last_played ASC LIMIT 1
  `, [CURRENT_PLAYLIST, NOW, NOW]);

  if (track) return track;

  // 3. Fallback: Modo de Emergência (Sem internet ou Playlist Vazia)
  emergency_track = LocalDB.query(`
      SELECT * FROM assets 
      WHERE is_emergency = 1
      AND valid_from <= ? AND valid_until >= ?
      AND local_file_exists = 1
      ORDER BY RANDOM() LIMIT 1
  `, [NOW, NOW]);

  if (emergency_track) {
      Log("WARNING: Tocando modo emergência");
      return emergency_track;
  }

  // 4. Cenário Catastrófico
  return BuiltInSilenceOrJingle();
}
```

---

## 4. Modelo de Dados Sugerido

### Tabela: `media_assets`
*   `id` (UUID)
*   `file_hash` (String - Integridade)
*   `cdn_url` (String)
*   `valid_from` (Timestamp)
*   `valid_until` (Timestamp - **CRÍTICO**)
*   `emergency_eligible` (Boolean)

### Tabela: `devices`
*   `id` (UUID)
*   `tenant_id` (FK)
*   `last_sync_at` (Timestamp)
*   `app_version` (String)
*   `cached_assets_count` (Int - Telemetria)

### Tabela: `sync_logs`
*   Registro auditável de o que cada player baixou e quando.

---

## 5. Direcionamento ao Servidor (Geo-Routing)

Utilizar **DNS Latency Routing** (AWS Route 53).

1.  O player faz query DNS para `api.lomuz.com`.
2.  O Route 53 analisa o IP de origem.
3.  Se o usuário está no Brasil, retorna IP do Load Balancer de **sa-east-1** (São Paulo).
4.  Se o usuário está na Europa, retorna IP do Load Balancer de **eu-west-1** (Irlanda).
5.  **Health Check:** Se SP cair, o DNS automaticamente responde com o IP dos EUA ou Europa.

---

## 6. Estratégias de Redução de Custo

1.  **Transferência de Dados (Bandwidth):**
    *   **Problema:** Sair dados da AWS é caro.
    *   **Solução:** Cache agressivo no cliente. Se o player já tem o arquivo `A.mp3`, a API nunca manda baixar de novo, mesmo que ele mude de playlist.
    *   **CDN:** Usar CloudFront na frente do S3 elimina custos diretos de GET do S3 e oferece Tier gratuito/barato.

2.  **Transcoding:**
    *   Converter tudo para **AAC-HE v2 (64kbps)**. Qualidade excelente para som ambiente, arquivo 4x menor que MP3 320kbps.

3.  **Compute:**
    *   Usar instâncias **Spot** (AWS) para os workers de processamento de áudio (transcoding), reduzindo custo em até 90%.

---

## 7. Checklist de Implementação

1.  [ ] **Schema DB:** Criar tabelas com colunas de validade (`valid_until`).
2.  [ ] **API Sync:** Criar endpoint que aceita o estado atual do player e retorna apenas o *delta*.
3.  [ ] **Storage:** Configurar S3 + CloudFront com CORS e Cache-Control imutável.
4.  [ ] **Player:** Implementar banco local (SQLite/IndexedDB) e lógica de download em fila.
5.  [ ] **Regras:** Implementar verificação rígida de data no `SELECT` do player.
6.  [ ] **Infra:** Configurar Route 53 Latency Routing.
