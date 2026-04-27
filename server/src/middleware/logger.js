const colors = require('colors');

const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    // Determine colors based on status code
    let statusColor = 'green';
    if (status >= 500) statusColor = 'red';
    else if (status >= 400) statusColor = 'yellow';
    else if (status >= 300) statusColor = 'cyan';

    // Format the log line
    const methodFormatted = method[method === 'GET' ? 'blue' : method === 'POST' ? 'green' : method === 'PATCH' ? 'yellow' : method === 'DELETE' ? 'red' : 'magenta'].bold;
    const statusFormatted = status.toString()[statusColor].bold;
    const durationFormatted = `${duration}ms`[duration > 500 ? 'red' : duration > 100 ? 'yellow' : 'green'];

    console.log(`${methodFormatted} ${url} - ${statusFormatted} - ${durationFormatted}`);
  });

  next();
};

module.exports = logger;
