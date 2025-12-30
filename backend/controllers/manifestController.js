
const manifestGenerator = require('../services/manifestGenerator');
const db = require('../db');

exports.getManifest = async (req, res) => {
  const { id } = req.params;

  try {
    const manifest = await manifestGenerator.generate(id);
    
    // Log audit (Opcional: amostragem para não floodar)
    if (Math.random() < 0.1) { // Loga 10% dos requests
        await db.query(
            "INSERT INTO audit_events (stream_id, event_type, payload) VALUES ($1, 'MANIFEST_GENERATED', $2)",
            [id, { items: manifest.queue.length }]
        );
    }

    res.json(manifest);

  } catch (error) {
    console.error(`Manifest Gen Error [${id}]:`, error);
    
    if (error.code === 'PAYMENT_REQUIRED') {
        return res.status(403).json({ error: error.message, code: error.code });
    }
    
    if (error.message === 'Stream not found') {
        return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to generate manifest' });
  }
};

exports.reportExecution = async (req, res) => {
    // Mantido para compatibilidade, lógica real movida para playbackController
    res.json({ success: true });
};
