/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/auth/useAuth.ts
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    loginUser,
    signupUser,
    logoutUser,
    checkAuthStatus,
    refreshTokenManual,
    clearError,
    forceLogout,
    updateUser,
    selectAuth,
    selectTokens,
} from "../../store/slice/authSlice";
import type { LoginRequest, SignupRequest } from "../../store/slice/authSlice";
import type { AppDispatch } from "../../store/store";

/**
 * 인증 관련 로직을 관리하는 커스텀 훅
 *
 * 주요 기능:
 * 1. 자동 인증 상태 확인 (앱 시작시)
 * 2. 토큰 자동 갱신 (만료 5분 전)
 * 3. 페이지 포커스시 토큰 검증
 * 4. 로그인/로그아웃/회원가입 처리
 */
export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector(selectAuth);
    const tokens = useSelector(selectTokens);

    const { isAuthenticated, user, loading, error } = authState;

    // 앱 시작시 인증 상태 확인
    useEffect(() => {
        if (tokens.accessToken && tokens.refreshToken && !user) {
            dispatch(checkAuthStatus());
        }
    }, [dispatch, tokens.accessToken, tokens.refreshToken, user]);

    // 토큰 자동 갱신 (만료 5분 전)
    useEffect(() => {
        if (!isAuthenticated || !tokens.expiresAt) return;

        const checkTokenExpiry = () => {
            const now = Date.now();
            const timeUntilExpiry = tokens.expiresAt! - now;
            const fiveMinutes = 5 * 60 * 1000; // 5분

            // 토큰이 5분 내에 만료되면 갱신
            if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
                dispatch(refreshTokenManual());
            }
        };

        // 즉시 확인
        checkTokenExpiry();

        // 1분마다 확인
        const interval = setInterval(checkTokenExpiry, 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, tokens.expiresAt, dispatch]);

    // 페이지 포커스시 토큰 유효성 검사
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleFocus = () => {
            // 토큰이 있지만 사용자 정보가 없으면 다시 확인
            if (tokens.accessToken && !user) {
                dispatch(checkAuthStatus());
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [isAuthenticated, tokens.accessToken, user, dispatch]);

    // 액션 함수들

    /**
     * 로그인
     */
    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                const result = await dispatch(loginUser(credentials)).unwrap();

                // 로그인 성공 후 사용자 정보 가져오기
                await dispatch(checkAuthStatus());

                console.log("로그인 성공:", result.message);
                return { success: true, data: result };
            } catch (error: any) {
                console.error("로그인 실패:", error);
                return { success: false, error };
            }
        },
        [dispatch]
    );

    /**
     * 회원가입
     */
    const signup = useCallback(
        async (userData: SignupRequest) => {
            try {
                const result = await dispatch(signupUser(userData)).unwrap();
                console.log("회원가입 성공:", result.message);
                return { success: true, data: result };
            } catch (error: any) {
                console.error("회원가입 실패:", error);
                return { success: false, error };
            }
        },
        [dispatch]
    );

    /**
     * 로그아웃
     */
    const logout = useCallback(async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            console.log("로그아웃 성공");
            return { success: true };
        } catch (error: any) {
            console.warn("로그아웃 처리 중 오류:", error);
            return { success: false, error };
        }
    }, [dispatch]);

    /**
     * 수동 토큰 갱신
     */
    const refreshToken = useCallback(async () => {
        try {
            await dispatch(refreshTokenManual()).unwrap();
            return { success: true };
        } catch (error: any) {
            console.error("토큰 갱신 실패:", error);
            return { success: false, error };
        }
    }, [dispatch]);

    /**
     * 에러 초기화
     */
    const resetError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    /**
     * 강제 로그아웃 (401 에러 등)
     */
    const handleForceLogout = useCallback(() => {
        dispatch(forceLogout());
    }, [dispatch]);

    /**
     * 사용자 정보 업데이트
     */
    const updateUserInfo = useCallback(
        (userData: Partial<typeof user>) => {
            if (userData) {
                dispatch(updateUser(userData));
            }
        },
        [dispatch]
    );

    /**
     * 인증 상태 새로고침
     */
    const revalidateAuth = useCallback(async () => {
        try {
            await dispatch(checkAuthStatus()).unwrap();
            return { success: true };
        } catch (error: any) {
            return { success: false, error };
        }
    }, [dispatch]);

    // 유틸리티 함수들

    /**
     * 토큰 상태 확인
     */
    const getTokenStatus = useCallback(() => {
        const now = Date.now();
        const isExpired = tokens.expiresAt ? tokens.expiresAt <= now : false;
        const timeUntilExpiry = tokens.expiresAt ? tokens.expiresAt - now : 0;

        return {
            isAuthenticated,
            hasTokens: !!(tokens.accessToken && tokens.refreshToken),
            isExpired,
            expiresAt: tokens.expiresAt,
            timeUntilExpiry,
            willExpireSoon: timeUntilExpiry <= 5 * 60 * 1000, // 5분 이내
        };
    }, [isAuthenticated, tokens]);

    /**
     * 권한 확인 (예시)
     */
    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (!isAuthenticated || !user) return false;

            // 실제 구현에서는 user.permissions 배열을 확인
            // return user.permissions?.includes(permission) || false;

            // 간단한 역할 기반 권한 체크 예시
            // if (user.role === "admin") return true;
            // if (user.role === "user" && permission !== "admin") return true;

            return true; // 기본적으로 로그인된 사용자는 모든 권한 허용
        },
        [isAuthenticated, user]
    );

    // 반환값
    return {
        // 상태 정보
        isAuthenticated,
        user,
        loading,
        error,
        tokens,

        // 기본 액션
        login,
        signup,
        logout,
        resetError,

        // 고급 액션
        refreshToken,
        forceLogout: handleForceLogout,
        updateUser: updateUserInfo,
        revalidateAuth,

        // 유틸리티
        hasPermission,
        getTokenStatus,
    };
};

/**
 * API 요청 시 자동으로 401 에러를 처리하는 훅
 * App.tsx에서 사용하여 전역적으로 적용
 */
export const useApiInterceptors = () => {
    const { forceLogout } = useAuth();

    useEffect(() => {
        // 이미 client.ts에서 인터셉터가 설정되어 있으므로
        // 여기서는 추가적인 처리만 수행
        console.log("API 인터셉터가 활성화되었습니다.");
    }, [forceLogout]);
};

export default useAuth;
