/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Divider,
    Avatar,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signupUser, clearError } from "../../store/slice/authSlice";
import type { AppDispatch } from "../../store/store";

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Redux 상태
    const { loading, error } = useSelector((state: any) => state.auth);

    // 폼 데이터 상태
    const [formData, setFormData] = useState<RegisterFormData>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // 비밀번호 표시/숨김 상태
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 유효성 검사 에러 상태
    const [validationErrors, setValidationErrors] = useState<
        Partial<RegisterFormData>
    >({});

    // 입력값 변경 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // 입력 시 해당 필드의 유효성 검사 에러 제거
        if (validationErrors[name as keyof RegisterFormData]) {
            setValidationErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }

        // Redux 에러 제거
        if (error) {
            dispatch(clearError());
        }
    };

    // 유효성 검사
    const validateForm = (): boolean => {
        const errors: Partial<RegisterFormData> = {};

        // 사용자명 검사
        if (!formData.username.trim()) {
            errors.username = "사용자명을 입력해주세요.";
        } else if (formData.username.length < 2) {
            errors.username = "사용자명은 2자 이상이어야 합니다.";
        }

        // 이메일 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = "이메일을 입력해주세요.";
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "올바른 이메일 형식을 입력해주세요.";
        }

        // 비밀번호 검사
        if (!formData.password) {
            errors.password = "비밀번호를 입력해주세요.";
        } else if (formData.password.length < 6) {
            errors.password = "비밀번호는 6자 이상이어야 합니다.";
        }

        // 비밀번호 확인 검사
        if (!formData.confirmPassword) {
            errors.confirmPassword = "비밀번호 확인을 입력해주세요.";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 회원가입 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await dispatch(
            signupUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            })
        )
            .unwrap()
            .then((res: any) => {
                console.log("res", res);
                alert("회원 가입 성공");
            })
            .catch((error: any) => {
                alert("회원가입 실패");
                console.error("회원가입 실패:", error);
            });
    };

    // 비밀번호 표시/숨김 토글
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #e1bee7 0%, #f8bbd9 50%, #bbdefb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
            }}
        >
            <Container maxWidth="sm">
                {/* 앱 로고 및 제목 */}
                <Box textAlign="center" mb={4}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "primary.main",
                            fontSize: "2rem",
                            margin: "0 auto",
                            mb: 2,
                        }}
                    >
                        📝
                    </Avatar>
                    <Typography variant="h4" color="primary" gutterBottom>
                        감정 일기
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        나의 감정을 기록하고 추억하는 공간
                    </Typography>
                </Box>

                {/* 회원가입 폼 카드 */}
                <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom align="center" mb={3}>
                        회원가입
                    </Typography>

                    {/* 에러 메시지 */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* 회원가입 폼 */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        {/* 사용자명 필드 */}
                        <TextField
                            fullWidth
                            required
                            id="username"
                            label="사용자명"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleInputChange}
                            error={!!validationErrors.username}
                            helperText={validationErrors.username}
                            variant="outlined"
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        👤
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* 이메일 필드 */}
                        <TextField
                            fullWidth
                            required
                            id="email"
                            label="이메일"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            variant="outlined"
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        📧
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* 비밀번호 필드 */}
                        <TextField
                            fullWidth
                            required
                            name="password"
                            label="비밀번호"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={!!validationErrors.password}
                            helperText={validationErrors.password}
                            variant="outlined"
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        🔒
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={togglePasswordVisibility}
                                            edge="end"
                                            disabled={loading}
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* 비밀번호 확인 필드 */}
                        <TextField
                            fullWidth
                            required
                            name="confirmPassword"
                            label="비밀번호 확인"
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            error={!!validationErrors.confirmPassword}
                            helperText={validationErrors.confirmPassword}
                            variant="outlined"
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        🔒
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirm password visibility"
                                            onClick={
                                                toggleConfirmPasswordVisibility
                                            }
                                            edge="end"
                                            disabled={loading}
                                        >
                                            {showConfirmPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* 회원가입 버튼 */}
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                background:
                                    "linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)",
                                },
                                "&:disabled": {
                                    background: "rgba(0, 0, 0, 0.12)",
                                },
                            }}
                        >
                            {loading ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                    회원가입 중...
                                </Box>
                            ) : (
                                "회원가입"
                            )}
                        </Button>

                        {/* 로그인 링크 */}
                        <Typography
                            variant="body2"
                            align="center"
                            color="text.secondary"
                        >
                            이미 계정이 있으신가요?{" "}
                            <Button
                                color="primary"
                                variant="text"
                                size="small"
                                onClick={() => navigate("/login")}
                                disabled={loading}
                            >
                                로그인
                            </Button>
                        </Typography>

                        <Divider>
                            <Typography variant="body2" color="text.secondary">
                                또는
                            </Typography>
                        </Divider>

                        {/* 소셜 로그인 버튼들 */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<span>📱</span>}
                                sx={{ py: 1.5 }}
                                disabled={loading}
                            >
                                Google
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<span>💬</span>}
                                sx={{ py: 1.5 }}
                                disabled={loading}
                            >
                                KakaoTalk
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* 하단 저작권 */}
                <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 3 }}
                >
                    © 2024 감정 일기. 모든 권리 보유.
                </Typography>
            </Container>
        </Box>
    );
};

export default RegisterPage;
