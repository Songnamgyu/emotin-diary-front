/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Avatar,
    IconButton,
    InputAdornment,
    Divider,
    Stack,
    Alert,
    CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
import { loginUser, clearError } from "../../store/slice/authSlice";
import type { RootState, AppDispatch } from "../../store/store";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    // 🔸 Redux 직접 사용
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (error) {
            dispatch(clearError());
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = "이메일을 입력해주세요";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다";
        }

        if (!formData.password) {
            newErrors.password = "비밀번호를 입력해주세요";
        } else if (formData.password.length < 6) {
            newErrors.password = "비밀번호는 6자 이상이어야 합니다";
        }

        return newErrors;
    };

    // 🔸 dispatch 직접 사용하는 handleSubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});
        dispatch(clearError());

        try {
            // ✅ dispatch로 직접 액션 호출
            const result = await dispatch(
                loginUser({
                    usernameOrEmail: formData.email,
                    password: formData.password,
                })
            ).unwrap(); // unwrap()으로 Promise 체인 사용

            // 성공 시 처리
            console.log("로그인 성공!", result);
            navigate("/dashboard");
        } catch (rejectedValue: any) {
            // 실패 시 처리 (에러는 Redux state에 자동 저장됨)
            console.error("로그인 실패:", rejectedValue);
            // 추가 에러 처리가 필요하면 여기서
        }
    };

    // 인증 상태 변화 감지하여 자동 리다이렉트 (선택사항)
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

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

                <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom align="center" mb={3}>
                        로그인
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="이메일"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!fieldErrors.email}
                            helperText={fieldErrors.email}
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

                        <TextField
                            fullWidth
                            label="비밀번호"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            error={!!fieldErrors.password}
                            helperText={fieldErrors.password}
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
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
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
                                    로그인 중...
                                </Box>
                            ) : (
                                "로그인"
                            )}
                        </Button>

                        <Typography
                            variant="body2"
                            align="center"
                            color="text.secondary"
                        >
                            계정이 없으신가요?{" "}
                            <Button
                                color="primary"
                                variant="text"
                                size="small"
                                onClick={() => navigate("/register")}
                                disabled={loading}
                            >
                                회원가입
                            </Button>
                        </Typography>

                        <Divider>
                            <Typography variant="body2" color="text.secondary">
                                또는
                            </Typography>
                        </Divider>

                        <Stack direction="row" spacing={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Google />}
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
                        </Stack>
                    </Box>
                </Paper>

                <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                    mt={3}
                >
                    © 2024 감정 일기. 모든 권리 보유.
                </Typography>
            </Container>
        </Box>
    );
};

export default LoginPage;

/**
 * 🔄 dispatch vs useAuth 비교:
 *
 * dispatch 방식의 장점:
 * ✅ Redux를 직접 사용하여 더 명시적
 * ✅ 미들웨어나 추가 로직이 필요 없음
 * ✅ Redux DevTools에서 액션 추적이 더 명확
 * ✅ unwrap()으로 Promise 체인 사용 가능
 *
 * dispatch 방식의 단점:
 * ❌ 컴포넌트에서 Redux 로직이 노출됨
 * ❌ useSelector로 상태를 수동으로 구독해야 함
 * ❌ 타입 안전성을 위해 AppDispatch 타입 지정 필요
 * ❌ 코드가 더 장황해짐
 *
 * useAuth 방식의 장점:
 * ✅ 인증 관련 로직이 캡슐화됨
 * ✅ 컴포넌트가 Redux에 직접 의존하지 않음
 * ✅ 테스트하기 쉬움
 * ✅ 재사용성이 높음
 * ✅ 코드가 더 간결함
 *
 * useAuth 방식의 단점:
 * ❌ 추가 추상화 레이어
 * ❌ 복잡한 상태 조작이 어려울 수 있음
 */
