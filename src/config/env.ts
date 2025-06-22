/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/env.ts
// 환경 타입 정의
type NodeEnv = "local" | "development" | "staging" | "production";
type LogLevel = "debug" | "info" | "warn" | "error";

// 환경 변수 검증 및 기본값 설정
const getNodeEnv = (): NodeEnv => {
    const env = import.meta.env.VITE_NODE_ENV;
    if (
        env === "local" ||
        env === "development" ||
        env === "staging" ||
        env === "production"
    ) {
        return env;
    }
    return "development"; // 기본값
};

export const ENV = {
    NODE_ENV: getNodeEnv(),
    API_BASE_URL:
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
    APP_ENV: import.meta.env.VITE_APP_ENV || "development",
    APP_NAME: import.meta.env.VITE_APP_NAME || "감정 일기",
    APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
    DEBUG: import.meta.env.VITE_DEBUG === "true",
} as const;

export const isDevelopment =
    ENV.NODE_ENV === "development" || ENV.NODE_ENV === "local";
export const isProduction = ENV.NODE_ENV === "production";
export const isStaging = ENV.NODE_ENV === "staging";
export const isLocal = ENV.NODE_ENV === "local";

// 환경별 설정 (타입 안전)
export const CONFIG = {
    local: {
        apiTimeout: 30000,
        enableDevTools: true,
        logLevel: "debug" as LogLevel,
    },
    development: {
        apiTimeout: 15000,
        enableDevTools: true,
        logLevel: "info" as LogLevel,
    },
    staging: {
        apiTimeout: 10000,
        enableDevTools: false,
        logLevel: "warn" as LogLevel,
    },
    production: {
        apiTimeout: 10000,
        enableDevTools: false,
        logLevel: "error" as LogLevel,
    },
} as const;

// 타입 안전한 현재 환경 설정
export const currentConfig = CONFIG[ENV.NODE_ENV];

// 로깅 유틸리티
export const logger = {
    debug: (...args: any[]) => {
        if (ENV.DEBUG && currentConfig.logLevel === "debug") {
            console.log("🐛 [DEBUG]", ...args);
        }
    },
    info: (...args: any[]) => {
        if (["debug", "info"].includes(currentConfig.logLevel)) {
            console.info("ℹ️ [INFO]", ...args);
        }
    },
    warn: (...args: any[]) => {
        if (["debug", "info", "warn"].includes(currentConfig.logLevel)) {
            console.warn("⚠️ [WARN]", ...args);
        }
    },
    error: (...args: any[]) => {
        console.error("❌ [ERROR]", ...args);
    },
};

// 환경 정보 출력
if (ENV.DEBUG) {
    console.group("🌍 Environment Configuration");
    console.log("Node Environment:", ENV.NODE_ENV);
    console.log("App Environment:", ENV.APP_ENV);
    console.log("API Base URL:", ENV.API_BASE_URL);
    console.log("Debug Mode:", ENV.DEBUG);
    console.log("Configuration:", currentConfig);
    console.groupEnd();
}
