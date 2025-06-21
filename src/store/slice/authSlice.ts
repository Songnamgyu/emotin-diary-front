/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { store } from "../store";
import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

export interface User {
    id: string;
    username: string;
    email: string;
    role?: string;
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    message: string;
    csrfToken?: string; // CSRF 토큰 (옵션)
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
    csrfToken: string | null; // CSRF 토큰 상태
}

// 🔸 Axios 인스턴스 설정
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    withCredentials: true, // 🍪 쿠키 자동 전송 활성화
    headers: {
        "Content-Type": "application/json",
    },
});

// 🛡️ CSRF 토큰 인터셉터
apiClient.interceptors.request.use((config) => {
    const csrfToken = store.getState().auth.csrfToken;
    if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
});

const getInitialAuthState = (): Partial<AuthState> => {
    // 🍪 Cookie는 서버에서만 접근 가능하므로 초기값만 설정
    // 실제 인증 상태는 앱 시작시 /auth/me API로 확인
    return {
        isAuthenticated: false,
        user: null,
        csrfToken: null,
    };
};

const initialState: AuthState = {
    loading: false,
    error: null,
    ...getInitialAuthState(),
} as AuthState;

// 🔸 비동기 액션들

/**
 * 🔍 현재 사용자 정보 확인 (앱 시작시)
 *
 * Cookie에 있는 토큰으로 사용자 정보를 가져옴
 * 새로고침 후 인증 상태를 복원하는데 사용
 */
export const checkAuthStatus = createAsyncThunk<
    LoginResponse,
    void,
    { rejectValue: string }
>("auth/checkAuthStatus", async (_, { rejectWithValue }) => {
    try {
        // 🍪 Cookie의 토큰으로 사용자 정보 조회
        const response = await apiClient.get("/auth/me");
        return response.data;
    } catch (error: any) {
        // 토큰이 없거나 만료된 경우
        if (error.response?.status === 401) {
            return rejectWithValue("인증이 필요합니다.");
        }
        return rejectWithValue("사용자 정보를 가져올 수 없습니다.");
    }
});

/**
 * 🔐 로그인 (Cookie 기반)
 */
export const loginUser = createAsyncThunk<
    LoginResponse,
    LoginRequest,
    { rejectValue: string }
>("auth/loginUser", async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
        // 🌐 서버로 로그인 요청
        const response = await apiClient.post("/auth/login", credentials);

        // 🍪 서버에서 httpOnly cookie로 JWT 토큰 설정됨
        // Set-Cookie: token=jwt_token; HttpOnly; Secure; SameSite=Strict; Max-Age=3600

        return response.data;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "로그인에 실패했습니다.";

        return rejectWithValue(errorMessage);
    }
});

/**
 * 🚪 로그아웃 (Cookie 기반)
 */
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            // 🌐 서버로 로그아웃 요청
            await apiClient.post("/auth/logout");

            // 🍪 서버에서 쿠키 삭제 처리
            // Set-Cookie: token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // 로그아웃 실패해도 클라이언트 상태는 초기화
            const errorMessage =
                error.response?.data?.message ||
                "로그아웃 처리 중 오류가 발생했습니다.";

            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * 🔄 토큰 갱신 (자동)
 */
export const refreshToken = createAsyncThunk<
    { csrfToken?: string },
    void,
    { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue }) => {
    try {
        // 🔄 리프레시 토큰으로 새 토큰 발급
        const response = await apiClient.post("/auth/refresh");

        // 🍪 새로운 토큰이 쿠키로 설정됨
        return response.data;
    } catch (error: any) {
        return rejectWithValue("토큰 갱신에 실패했습니다.");
    }
});

// 🔸 Slice 정의
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        forceLogout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.csrfToken = null;
            state.error = null;
            state.loading = false;
        },

        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        // CSRF 토큰 설정
        setCsrfToken: (state, action: PayloadAction<string>) => {
            state.csrfToken = action.payload;
        },
        resetError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // 🔍 인증 상태 확인
        builder
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.csrfToken = action.payload.csrfToken || null;
                state.error = null;
            })
            .addCase(checkAuthStatus.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.csrfToken = null;
                state.error = null; // 초기 로딩 실패는 에러로 표시하지 않음
            });

        // 🔐 로그인
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.csrfToken = action.payload.csrfToken || null;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.csrfToken = null;
                state.error = action.payload || "로그인에 실패했습니다.";
            });

        // 🚪 로그아웃
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.csrfToken = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                // 로그아웃 실패해도 상태는 초기화
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.csrfToken = null;
                state.error = action.payload || null;
            });

        // 🔄 토큰 갱신
        builder
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.csrfToken = action.payload.csrfToken || null;
            })
            .addCase(refreshToken.rejected, (state) => {
                // 토큰 갱신 실패시 로그아웃 처리
                state.isAuthenticated = false;
                state.user = null;
                state.csrfToken = null;
            });
    },
});

// 🔸 내보내기
export const { clearError, forceLogout, updateUser, setCsrfToken, resetError } =
    authSlice.actions;
export default authSlice.reducer;

// 🔸 선택자
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
    state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) =>
    state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectCsrfToken = (state: { auth: AuthState }) =>
    state.auth.csrfToken;
