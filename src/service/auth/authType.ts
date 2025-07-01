// types/authType.ts
export interface LoginRequest {
    usernameOrEmail: string; // 백엔드 API에 맞게 수정
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
}

// 백엔드 ApiResponse 구조에 맞게 수정
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
}

// JWT 인증 응답 (백엔드 JwtAuthenticationResponse에 맞게)
export interface JwtAuthenticationResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number; // seconds
}

// 로그인 성공 응답
export interface LoginResponse {
    statusCode: number;
    message: string;
    data: JwtAuthenticationResponse;
}

// 회원가입 응답
export interface SignupResponse {
    statusCode: number;
    message: string;
}

// 토큰 갱신 요청
export interface TokenRefreshRequest {
    refreshToken: string;
}

// 현재 사용자 정보 응답
export interface UserMeResponse {
    statusCode: number;
    message: string;
    data: User;
}
