
const db = require('../db');

/**
 * GET /api/v1/system/readiness
 * Verifica a saúde profunda do sistema e integridade dos dados.
 * Não bloqueia operação, apenas reporta anomalias.
 */
exports.getReadiness = async (req, res) => {
    const report = {
        timestamp: new Date().toISOString(),
        status: 'OK',
        checks: {
            database_ok: false,
            billing_ok: process.env.BILLING_ENABLED === 'true',
            manifest_ok: true, // Assumed true unless errors found below
            media_pipeline_ok: true,
            player_heartbeat_ok: true
        },
        warnings: [],
        last_errors: []
    };

    try {
        // 1. Check DB Latency & Connection
        const start = Date.now();
        await db.query('SELECT 1');
        report.checks.database_ok = true;
        report.db_latency_ms = Date.now() - start;

        // 2. DATA INTEGRITY CHECKS (Validações Críticas)
        
        // A) Streams órfãs (sem company_id)
        const orphanStreams = await db.query('SELECT count(*) FROM streams WHERE company_id IS NULL');
        if (parseInt(orphanStreams.rows[0].count) > 0) {
            report.warnings.push(`CRITICAL: ${orphanStreams.rows[0].count} streams without company_id detected.`);
            report.status = 'DEGRADED';
        }

        // B) Mídia travada em processamento (Pipeline Stuck)
        const stuckMedia = await db.query(
            "SELECT count(*) FROM media_files WHERE status = 'PROCESSING' AND created_at < NOW() - INTERVAL '1 hour'"
        );
        if (parseInt(stuckMedia.rows[0].count) > 0) {
            report.warnings.push(`WARN: ${stuckMedia.rows[0].count} media files stuck in PROCESSING > 1h.`);
            report.checks.media_pipeline_ok = false;
            report.status = 'DEGRADED';
        }

        // C) Devices Zumbis (Online mas sem heartbeat recente)
        const zombieDevices = await db.query(
            "SELECT count(*) FROM devices WHERE status = 'ONLINE' AND last_seen_at < NOW() - INTERVAL '10 minutes'"
        );
        if (parseInt(zombieDevices.rows[0].count) > 0) {
            report.warnings.push(`WARN: ${zombieDevices.rows[0].count} devices marked ONLINE but silent > 10min.`);
            report.checks.player_heartbeat_ok = false;
        }

        // D) Manifest sem Subscription (Integridade de Negócio)
        // Verifica se existem streams ATIVAS (gerando logs recentes) sem assinatura válida
        const rogueStreams = await db.query(`
            SELECT count(distinct s.id) 
            FROM streams s
            JOIN playback_logs pl ON s.id = pl.stream_id
            LEFT JOIN subscriptions sub ON s.id = sub.stream_id
            WHERE pl.created_at > NOW() - INTERVAL '1 hour'
            AND (sub.status IS NULL OR sub.status NOT IN ('active', 'trialing'))
        `);
        
        if (parseInt(rogueStreams.rows[0].count) > 0) {
            report.warnings.push(`BILLING: ${rogueStreams.rows[0].count} streams playing without valid subscription.`);
            if (report.checks.billing_ok) report.status = 'DEGRADED';
        }

        // Log Audit Event
        const eventType = report.warnings.length > 0 ? 'SYSTEM_CHECK_WARN' : 'SYSTEM_CHECK_OK';
        // Usando connection pool direto para audit não bloquear resposta principal
        db.query(
            "INSERT INTO audit_events (stream_id, event_type, payload) VALUES (NULL, $1, $2)",
            [eventType, { warnings: report.warnings, latency: report.db_latency_ms }]
        ).catch(err => console.error("Audit log failed", err));

        res.json(report);

    } catch (error) {
        console.error('[System Readiness] Failed:', error);
        report.status = 'FAIL';
        report.last_errors.push(error.message);
        
        db.query(
            "INSERT INTO audit_events (stream_id, event_type, payload) VALUES (NULL, 'SYSTEM_CHECK_FAIL', $1)",
            [{ error: error.message }]
        ).catch(() => {});

        res.status(503).json(report);
    }
};
