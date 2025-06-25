/* eslint-disable @typescript-eslint/no-explicit-any */
// src/service/client.ts
import axios from "axios";
import { ENV, currentConfig } from "../config/env";
import { tokenManager } from "./tokenManager";

interface QueueItem {
    resolve: (value: string) => void;
    reject: (error: any) => void;
}

export const cookieStorage = {
    getCookie(name: string): string | null {
        const nameEQ = name + "=";
        const ca = document.cookie.split(";");

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === " ") c = c.substring(1);
            if (c.indexOf(nameEQ) === 0)
                return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    setCookie(name: string, value: string, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        const sameSite = "; SameSite=Strict";
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${secure}${sameSite}`;
    },
    deleteCookie(name: string) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    },
    getAccessToken() {
        return cookieStorage.getCookie("accessToken");
    },
    getRefreshToken() {
        return cookieStorage.getCookie("refreshToken");
    },
    setTokens(accessToken: string, refreshToken: string, days: number) {
        cookieStorage.setCookie("accessToken", accessToken, days);
        cookieStorage.setCookie("refreshToken", refreshToken, 7);
    },
    clearTokens() {
        cookieStorage.deleteCookie("accessToken");
        cookieStorage.deleteCookie("refreshToken");
    },
};

// Axios 인스턴스
export const client = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: currentConfig.apiTimeout,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// 콜백 (초기 기본값)
let onForceLogout = () => {
    tokenManager.clear();
    window.location.href = "/login";
};

let onTokenRefresh = (tokenSet: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}) => {
    tokenManager.setTokens(tokenSet);
};

export function registerAuthHandlers({
    forceLogout,
    tokenRefresh,
}: {
    forceLogout: () => void;
    tokenRefresh: (tokenSet: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }) => void;
}) {
    onForceLogout = forceLogout;
    onTokenRefresh = tokenRefresh;
}

// 인터셉터
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: any, token: string | null = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    failedQueue = [];
}

client.interceptors.request.use((config) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh"
        ) {
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return client(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = tokenManager.getRefreshToken();
            if (!refreshToken) {
                onForceLogout();
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(
                    `${client.defaults.baseURL}/auth/refresh`,
                    { refreshToken },
                    { withCredentials: true }
                );

                const { data } = res.data;
                const {
                    accessToken,
                    refreshToken: newRefreshToken,
                    expiresIn,
                } = data;

                onTokenRefresh({
                    accessToken,
                    refreshToken: newRefreshToken,
                    expiresIn,
                });

                processQueue(null, accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return client(originalRequest);
            } catch (err) {
                processQueue(err, null);
                onForceLogout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
