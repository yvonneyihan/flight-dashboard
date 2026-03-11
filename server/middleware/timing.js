module.exports = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    // Skip health check paths
    if (req.path === '/health' || 
        req.path === '/api/predictions/health' ||
        req.path.includes('/health')) {
      return;
    }
    
    let color = '\x1b[32m';
    if (duration > 500) color = '\x1b[33m';
    if (duration > 1000) color = '\x1b[31m';
    
    console.log(
      `${color}[${timestamp}] ${req.method} ${req.path} - ${duration}ms - ${res.statusCode}\x1b[0m`
    );
  });
  
  next();
};