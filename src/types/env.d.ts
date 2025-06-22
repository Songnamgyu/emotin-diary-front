// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NODE_ENV: "local" | "development" | "staging" | "production";
    readonly VITE_API_BASE_URL: string;
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_DEBUG: "true" | "false";
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// 전역 변수 타입 정의
declare const __APP_ENV__: string;
declare const __API_URL__: string;
