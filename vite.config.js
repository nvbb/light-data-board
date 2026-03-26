import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'; // 新增这行
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(), // 新增这行
        viteSingleFile()
    ],
});
