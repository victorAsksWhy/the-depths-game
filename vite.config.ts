import { defineConfig } from 'vite';
export default defineConfig({
    build: {
        sourcemap:true,
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
});
