/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { ConfigEnv, UserConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
    // 환경 변수 로드 (process.cwd() 대신 절대 경로 사용)
    const env = loadEnv(mode, path.resolve(__dirname), "");

    console.log(`🚀 Building for ${mode} mode`);
    console.log(`📡 API URL: ${env.VITE_API_BASE_URL}`);

    return {
        plugins: [react()],

        // 개발 서버 설정
        server: {
            port: 3000,
            host: true, // 네트워크에서 접근 가능
            open: true, // 브라우저 자동 열기
        },

        // 빌드 설정
        build: {
            outDir: "dist",
            sourcemap: mode !== "production", // 운영환경에서는 소스맵 제거
            minify: mode === "production" ? "esbuild" : false,

            // 청크 분할 설정
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ["react", "react-dom"],
                        mui: ["@mui/material", "@mui/icons-material"],
                        redux: ["@reduxjs/toolkit", "react-redux"],
                        router: ["react-router-dom"],
                    },
                },
            },
        },

        // 환경별 별칭 설정
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                "@components": path.resolve(__dirname, "./src/components"),
                "@pages": path.resolve(__dirname, "./src/pages"),
                "@hooks": path.resolve(__dirname, "./src/hooks"),
                "@store": path.resolve(__dirname, "./src/store"),
                "@api": path.resolve(__dirname, "./src/api"),
                "@types": path.resolve(__dirname, "./src/types"),
                "@utils": path.resolve(__dirname, "./src/utils"),
            },
        },

        // 환경 변수 설정
        define: {
            __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
            __API_URL__: JSON.stringify(env.VITE_API_BASE_URL),
        },

        // 미리보기 설정
        preview: {
            port: 4173,
            host: true,
        },
    };
});
