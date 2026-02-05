import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/beszel': {
                target: 'https://beszel.saik22.com',
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
                target: 'https://beszel.saik22.com',
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
                target: 'https://beszel.saik22.com',
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
                target: 'https://beszel.saik22.com',
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
                target: 'https://beszel.saik22.com',
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
                target: 'https://beszel.saik22.com',
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
