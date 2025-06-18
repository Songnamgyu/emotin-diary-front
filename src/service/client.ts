import axios from "axios";

export const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 환경별로 자동 변경
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// JWT 토큰 자동 첨부
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 401 에러 시 자동 로그아웃
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
