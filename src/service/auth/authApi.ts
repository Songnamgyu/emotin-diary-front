// api/authApi.ts
import { client, cookieStorage } from "../client";
import type {
    LoginRequest,
    SignupRequest,
    LoginResponse,
    SignupResponse,
    UserMeResponse,
} from "../auth/authType";

export const authApi = {
    // 로그인
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await client.post("/auth/login", credentials);
        return response.data;
    },

    // 회원가입
    signup: async (userData: SignupRequest): Promise<SignupResponse> => {
        const response = await client.post("/auth/signup", userData);
        return response.data;
    },

    // 로그아웃
    logout: async (): Promise<void> => {
        const refreshToken = cookieStorage.getRefreshToken();
        if (refreshToken) {
            try {
                await client.post("/auth/logout", { refreshToken });
            } catch (error) {
                console.warn("로그아웃 API 호출 실패:", error);
                // 서버 로그아웃 실패해도 클라이언트는 정리
            }
        }
        // 쿠키에서 토큰 정리
        cookieStorage.clearTokens();
    },

    // 토큰 갱신
    refreshToken: async (refreshTokenValue: string): Promise<LoginResponse> => {
        const response = await client.post("/auth/refresh", {
            refreshToken: refreshTokenValue,
        });
        return response.data;
    },

    // 현재 사용자 정보 조회
    me: async (): Promise<UserMeResponse> => {
        const response = await client.get("/auth/me");
        return response.data;
    },

    // 토큰 유효성 검사
    validateToken: async (): Promise<boolean> => {
        try {
            await client.get("/auth/validate");
            return true;
        } catch {
            return false;
        }
    },
};
