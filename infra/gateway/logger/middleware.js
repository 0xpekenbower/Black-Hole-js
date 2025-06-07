import logger from './index.js';

export default function loggerMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    const { method, url } = req;
    const { statusCode } = res;
    
    const logLevel = statusCode >= 500 ? 'error' : 
                     statusCode >= 400 ? 'warn' : 
                     statusCode >= 300 ? 'info' : 
                     'debug';
    
    logger[logLevel]({
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`
    }, `${method} ${url} ${statusCode} - ${responseTime}ms`);
  });
  
  next();
} 