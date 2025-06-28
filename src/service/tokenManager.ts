// src/service/tokenManager.ts
import { cookieStorage } from "./client";

export interface TokenSet {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const tokenManager = {
    getAccessToken(): string | null {
        return cookieStorage.getAccessToken();
    },

    getRefreshToken(): string | null {
        return cookieStorage.getRefreshToken();
    },

    setTokens({ accessToken, refreshToken, expiresIn }: TokenSet) {
        const accessTokenExpireDays = expiresIn
            ? expiresIn / (24 * 60 * 60)
            : 1;
        cookieStorage.setTokens(
            accessToken,
            refreshToken,
            accessTokenExpireDays
        );
    },

    clear() {
        cookieStorage.clearTokens();
    },
};
