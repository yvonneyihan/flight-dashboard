module.exports = (req, res, next) => {
  const start = Date.now();
  
  // Capture when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    // Color code based on response time
    let color = '\x1b[32m'; // Green for fast
    if (duration > 500) color = '\x1b[33m'; // Yellow for medium
    if (duration > 1000) color = '\x1b[31m'; // Red for slow
    
    console.log(
      `${color}[${timestamp}] ${req.method} ${req.path} - ${duration}ms - ${res.statusCode}\x1b[0m`
    );
  });
  
  next();
};
