
const db = require('../db');

// POST /api/v1/ad-requests
exports.createRequest = async (req, res) => {
  const { stream_id, type, voice_id, text_original, text_final, ai_feedback } = req.body;

  if (text_final.length > 500) {
      return res.status(400).json({ error: 'Text exceeds 500 characters limit.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO ad_requests 
       (stream_id, type, voice_id, text_original, text_final, status, ai_feedback)
       VALUES ($1, $2, $3, $4, $5, 'REQUESTED', $6)
       RETURNING *`,
      [stream_id, type, voice_id, text_original, text_final, ai_feedback]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create Ad Request Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/ad-requests/ai-review
exports.reviewScript = async (req, res) => {
    const { text } = req.body;
    
    // Stub for AI Logic. In production, call OpenAI/Gemini here.
    // Simulating marketing improvement:
    const improvedText = `📢 ATENÇÃO! ${text} \n\nVenha conferir agora mesmo! Oferta exclusiva por tempo limitado.`;

    res.json({
        original: text,
        suggestion: improvedText,
        reason: "Adicionei gatilhos de urgência e uma chamada para ação mais clara para aumentar a conversão."
    });
};

// GET /api/v1/ad-requests/:streamId
exports.listRequests = async (req, res) => {
    const { streamId } = req.params;
    try {
        const result = await db.query(
            "SELECT * FROM ad_requests WHERE stream_id = $1 ORDER BY created_at DESC",
            [streamId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
