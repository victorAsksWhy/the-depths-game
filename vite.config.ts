import { defineConfig } from "vite";
export default defineConfig({
    build:{
        outDir:'dist',
        rollupOptions:{
            input:'src/code.ts'
        },
    },
})