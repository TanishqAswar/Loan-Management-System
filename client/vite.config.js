import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import colors from 'colors';

// Custom plugin to log frontend requests through the proxy
function proxyLogger() {
  return {
    name: 'proxy-logger',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/api')) {
          const start = Date.now();
          res.on('finish', () => {
            const duration = Date.now() - start;
            const method = req.method;
            const url = req.url;
            const status = res.statusCode;

            let statusColor = 'green';
            if (status >= 500) statusColor = 'red';
            else if (status >= 400) statusColor = 'yellow';
            else if (status >= 300) statusColor = 'cyan';

            const methodFormatted = method[method === 'GET' ? 'blue' : method === 'POST' ? 'green' : method === 'PATCH' ? 'yellow' : method === 'DELETE' ? 'red' : 'magenta'].bold;
            const statusFormatted = status.toString()[statusColor].bold;
            const durationFormatted = `${duration}ms`[duration > 500 ? 'red' : duration > 100 ? 'yellow' : 'green'];

            console.log(`[Frontend]`.magenta.bold + ` ${methodFormatted} ${url} - ${statusFormatted} - ${durationFormatted}`);
          });
        }
        next();
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), proxyLogger()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
