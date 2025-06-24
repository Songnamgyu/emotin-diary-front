/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";
import type {
    LoginRequest,
    LoginResponse,
    SignupRequest,
    SignupResponse,
    User,
} from "../../service/auth/authType";
import { cookieStorage } from "../../service/client";
import { authApi } from "../../service/auth/authApi";

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: string | null;
    tokenExpiresAt: number | null; // 토큰 만료 시간 (timestamp)
}

// 초기 상태 설정 (쿠키에서 토큰 복원)
const getInitialAuthState = (): Partial<AuthState> => {
    const accessToken = cookieStorage.getAccessToken();
    const refreshToken = cookieStorage.getRefreshToken();

    return {
        isAuthenticated: !!(accessToken && refreshToken),
        accessToken,
        refreshToken,
        user: null, // 사용자 정보는 checkAuthStatus에서 가져옴
        tokenExpiresAt: null,
    };
};

const initialState: AuthState = {
    loading: false,
    error: null,
    ...getInitialAuthState(),
} as AuthState;

// 로그인
export const loginUser = createAsyncThunk<
    LoginResponse,
    LoginRequest,
    { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const response = await authApi.login(credentials);

        // 성공 여부 확인
        if (response.statusCode !== 200 || !response.data) {
            return rejectWithValue(
                response.message || "로그인에 실패했습니다."
            );
        }

        // 토큰 저장
        const { accessToken, refreshToken, expiresIn } = response.data;
        const accessTokenExpireDays = expiresIn
            ? expiresIn / (24 * 60 * 60)
            : 1;
        cookieStorage.setTokens(
            accessToken,
            refreshToken,
            accessTokenExpireDays
        );

        return response;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "로그인에 실패했습니다.";
        return rejectWithValue(errorMessage);
    }
});

// 회원가입
export const signupUser = createAsyncThunk<
    SignupResponse,
    SignupRequest,
    { rejectValue: string }
>("auth/signupUser", async (userData, { rejectWithValue }) => {
    try {
        const response = await authApi.signup(userData);

        if (response.statusCode !== 200) {
            return rejectWithValue(
                response.message || "회원가입에 실패했습니다."
            );
        }

        return response;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "회원가입에 실패했습니다.";
        return rejectWithValue(errorMessage);
    }
});

// 로그아웃
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();
        } catch (error: any) {
            console.warn("로그아웃 API 호출 실패:", error);
            // 서버 로그아웃 실패해도 클라이언트 상태는 정리
        }

        // 토큰 정리
        cookieStorage.clearTokens();
    }
);

// 현재 사용자 정보 확인
export const checkAuthStatus = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>("auth/checkAuthStatus", async (_, { rejectWithValue }) => {
    try {
        const accessToken = cookieStorage.getAccessToken();
        const refreshToken = cookieStorage.getRefreshToken();

        if (!accessToken || !refreshToken) {
            return rejectWithValue("토큰이 없습니다.");
        }

        const response = await authApi.me();

        if (response.statusCode !== 200 || !response.data) {
            return rejectWithValue("사용자 정보를 가져올 수 없습니다.");
        }

        return response.data;
    } catch (error: any) {
        // 토큰 만료 등의 이유로 실패하면 토큰 정리
        cookieStorage.clearTokens();
        return rejectWithValue("인증 확인에 실패했습니다.");
    }
});

// 토큰 수동 갱신
export const refreshTokenManual = createAsyncThunk<
    LoginResponse,
    void,
    { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue }) => {
    try {
        const refreshToken = cookieStorage.getRefreshToken();

        if (!refreshToken) {
            return rejectWithValue("Refresh Token이 없습니다.");
        }

        const response = await authApi.refreshToken(refreshToken);

        if (response.statusCode !== 200 || !response.data) {
            return rejectWithValue("토큰 갱신에 실패했습니다.");
        }

        // 새 토큰을 쿠키에 저장
        const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn,
        } = response.data;
        const accessTokenExpireDays = expiresIn
            ? expiresIn / (24 * 60 * 60)
            : 1;
        cookieStorage.setTokens(
            newAccessToken,
            newRefreshToken,
            accessTokenExpireDays
        );

        return response;
    } catch (error: any) {
        // 갱신 실패 시 토큰 정리
        cookieStorage.clearTokens();
        return rejectWithValue("토큰 갱신에 실패했습니다.");
    }
});
// Slice 정의
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // 에러 초기화
        clearError: (state) => {
            state.error = null;
        },

        // 강제 로그아웃 (401 에러 등)
        forceLogout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.tokenExpiresAt = null;
            state.error = null;
            state.loading = false;
            cookieStorage.clearTokens();
        },

        // 사용자 정보 업데이트
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        // 토큰 설정 (인터셉터에서 사용)
        setTokens: (
            state,
            action: PayloadAction<{
                accessToken: string;
                refreshToken: string;
                expiresIn?: number;
            }>
        ) => {
            const { accessToken, refreshToken, expiresIn } = action.payload;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;

            if (expiresIn) {
                state.tokenExpiresAt = Date.now() + expiresIn * 1000;
            }
        },

        // 에러 리셋
        resetError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // 로그인
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.accessToken = action.payload.data.accessToken;
                state.refreshToken = action.payload.data.refreshToken;
                state.tokenExpiresAt =
                    Date.now() + action.payload.data.expiresIn * 1000;
                state.error = null;
                // 사용자 정보는 별도로 checkAuthStatus에서 가져옴
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.tokenExpiresAt = null;
                state.error = action.payload || "로그인에 실패했습니다.";
            });

        // 회원가입
        builder
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "회원가입에 실패했습니다.";
            });

        // 로그아웃
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.tokenExpiresAt = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                // 로그아웃 실패해도 상태는 초기화
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.tokenExpiresAt = null;
            });

        // 인증 상태 확인
        builder
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.tokenExpiresAt = null;
                state.error = null; // 초기 로딩 실패는 에러로 표시하지 않음
            });

        // 토큰 갱신
        builder
            .addCase(refreshTokenManual.fulfilled, (state, action) => {
                state.accessToken = action.payload.data.accessToken;
                state.refreshToken = action.payload.data.refreshToken;
                state.tokenExpiresAt =
                    Date.now() + action.payload.data.expiresIn * 1000;
                state.isAuthenticated = true;
            })
            .addCase(refreshTokenManual.rejected, (state) => {
                // 토큰 갱신 실패시 로그아웃 처리
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.tokenExpiresAt = null;
            });
    },
});

// 내보내기
export const { clearError, forceLogout, updateUser, setTokens, resetError } =
    authSlice.actions;

export default authSlice.reducer;

// 선택자
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
    state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) =>
    state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectTokens = (state: { auth: AuthState }) => ({
    accessToken: state.auth.accessToken,
    refreshToken: state.auth.refreshToken,
    expiresAt: state.auth.tokenExpiresAt,
});

// 타입 내보내기
export type { LoginRequest, SignupRequest, User };
