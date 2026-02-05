import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/beszel': {
                target: 'http://192.168.68.86:8090',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/beszel/, ''),
                configure: (proxy, _options) => {
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        // Remove security headers that prevent embedding
                        delete proxyRes.headers['x-frame-options'];
                        delete proxyRes.headers['content-security-policy'];
                        delete proxyRes.headers['frame-options'];
                    });
                },
            },
            // Proxy Beszel Assets
            '/assets': {
                target: 'http://192.168.68.86:8090',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('proxyRes', (proxyRes) => {
                        delete proxyRes.headers['x-frame-options'];
                        delete proxyRes.headers['content-security-policy'];
                    });
                }
            },
            '/static': {
                target: 'http://192.168.68.86:8090',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('proxyRes', (proxyRes) => {
                        delete proxyRes.headers['x-frame-options'];
                        delete proxyRes.headers['content-security-policy'];
                    });
                }
            },
            // Proxy Beszel API (PocketBase)
            '/api/collections': {
                target: 'http://192.168.68.86:8090',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('proxyRes', (proxyRes) => {
                        delete proxyRes.headers['x-frame-options'];
                        delete proxyRes.headers['content-security-policy'];
                    });
                }
            },
            // Proxy Beszel Auth
            '/api/admins': {
                target: 'http://192.168.68.86:8090',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('proxyRes', (proxyRes) => {
                        delete proxyRes.headers['x-frame-options'];
                        delete proxyRes.headers['content-security-policy'];
                    });
                }
            },
            '/api/health': {
                target: 'http://192.168.68.86:8090',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('proxyRes', (proxyRes) => {
                        delete proxyRes.headers['x-frame-options'];
                        delete proxyRes.headers['content-security-policy'];
                    });
                }
            }
        }
    }
});
