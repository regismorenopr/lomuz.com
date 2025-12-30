
// Centraliza o tratamento de erros para evitar try/catch repetitivo e expor stack traces em produção
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log estruturado do erro (pode ser enviado para Sentry/Datadog futuramente)
  console.error(`[ERROR] ${req.method} ${req.url} - IP: ${req.ip} - Msg: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Erro interno do servidor' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
