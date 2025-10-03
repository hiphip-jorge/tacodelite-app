import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(() => {
    // Determine output directory based on environment
    const environment = process.env.VITE_ENVIRONMENT || 'development';
    const outDir =
        environment === 'production'
            ? 'dist/production'
            : environment === 'staging'
              ? 'dist/staging'
              : 'dist';

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
        },
        base: './', // Use relative paths instead of absolute
        build: {
            outDir: outDir,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                },
                output: {
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]',
                },
            },
            // Ensure assets are built for AWS deployment
            assetsDir: 'assets',
            manifest: true,
        },
    };
});
