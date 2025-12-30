
const db = require('../db');

// Listar Rádios (GET /api/v1/radios)
exports.listStreams = async (req, res, next) => {
    try {
        let query = 'SELECT * FROM streams ORDER BY created_at DESC';
        let params = [];

        // Filtro por empresa se não for Diretor Geral
        if (req.user && req.user.role !== 'DIRECTOR' && req.user.company_id) {
            query = 'SELECT * FROM streams WHERE company_id = $1 ORDER BY created_at DESC';
            params = [req.user.company_id];
        }

        const result = await db.query(query, params);
        console.log(`[API] Listando ${result.rows.length} rádios.`);
        res.json(result.rows);
    } catch (e) {
        console.error("Erro ao listar radios:", e);
        next(e);
    }
};

// Criar Rádio (POST /api/v1/streams)
exports.createStream = async (req, res, next) => {
    const { name, companyId, segment } = req.body; 
    
    try {
        // Resolve a empresa (Tenant)
        let safeCompanyId = companyId || (req.user ? req.user.company_id : null);
        
        if (!safeCompanyId) {
            const defaultCo = await db.query("SELECT id FROM companies LIMIT 1");
            if (defaultCo.rows.length > 0) safeCompanyId = defaultCo.rows[0].id;
        }

        if (!safeCompanyId) {
            return res.status(400).json({ error: "Nenhuma empresa vinculada. Execute o setup inicial." });
        }

        console.log(`[API] Criando rádio '${name}' para empresa ${safeCompanyId}`);
        
        // 1. Inserir Rádio
        const result = await db.query(
            "INSERT INTO streams (company_id, stream_name, status, segment) VALUES ($1, $2, 'ONLINE', $3) RETURNING *",
            [safeCompanyId, name || 'Nova Rádio', segment || 'Outros']
        );
        
        const newRadio = result.rows[0];

        // 2. Inicializar Configurações Padrão
        await db.query(
            "INSERT INTO radio_settings (id, music_volume, media_volume) VALUES ($1, 80, 100) ON CONFLICT DO NOTHING",
            [newRadio.id]
        );

        res.json({ 
            id: newRadio.id, 
            name: newRadio.stream_name, 
            success: true,
            data: newRadio
        });
    } catch(e) {
        console.error("Erro ao criar stream:", e);
        next(e);
    }
};

// Player Config (GET /api/v1/streams/:id/player-config)
exports.getPlayerConfig = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT 
                s.stream_name,
                s.stream_url,
                COALESCE(rs.music_volume, 80) as music_volume,
                COALESCE(rs.media_volume, 100) as media_volume,
                COALESCE(rs.bitrate, 128) as bitrate,
                COALESCE(rs.weather_city, 'São Paulo') as weather_city
            FROM streams s
            LEFT JOIN radio_settings rs ON s.id = rs.id
            WHERE s.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rádio não encontrada' });
        }

        const data = result.rows[0];
        res.json({
            streamName: data.stream_name,
            streamUrl: data.stream_url,
            musicVolume: data.music_volume,
            mediaVolume: data.media_volume,
            bitrate: data.bitrate,
            weatherCity: data.weather_city
        });
    } catch(e) {
        next(e);
    }
};

// Stubs para evitar quebras em outros fluxos
exports.getStep3 = async (req, res) => { res.json({}); };
exports.saveStep3 = async (req, res) => { res.json({ success: true }); };
exports.restoreDefault = async (req, res) => { res.json({ success: true }); };
exports.heartbeat = async (req, res) => { res.json({success:true}); };
exports.getOnlineDevices = async (req, res) => { res.json([]); };
exports.checkAccess = async (req, res) => { res.json({ allowed: true }); };
exports.getOperationalDashboard = async (req, res) => { res.json({ stats: { online: 0, offline: 0 }, alerts: [] }); };
