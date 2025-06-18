import React, { useState } from "react";
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
    // CircularProgress,
    // Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
// import { useAuth } from '../../hooks/auth/useAuth';

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    // const { login, loading, error } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // 에러 제거
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     const newErrors: Record<string, string> = {};

    //     if (!formData.email) newErrors.email = "이메일을 입력해주세요";
    //     if (!formData.password) newErrors.password = "비밀번호를 입력해주세요";

    //     if (Object.keys(newErrors).length > 0) {
    //         setErrors(newErrors);
    //         return;
    //     }

    //     await login(formData);
    // };

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
                {/* 로고 및 헤더 */}
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

                {/* 로그인 폼 */}
                <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom align="center" mb={3}>
                        로그인
                    </Typography>

                    {/* {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )} */}

                    <Box
                        component="form"
                        // onSubmit={handleSubmit}
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
                            error={!!errors.email}
                            helperText={errors.email}
                            variant="outlined"
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
                            error={!!errors.password}
                            helperText={errors.password}
                            variant="outlined"
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
                            // disabled={loading}
                            sx={{
                                py: 1.5,
                                background:
                                    "linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)",
                                },
                            }}
                        >
                            {/* {loading ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                    로그인 중...
                                </Box>
                            ) : (
                                "로그인"
                            )} */}
                        </Button>

                        <Typography
                            variant="body2"
                            align="center"
                            color="text.secondary"
                        >
                            계정이 없으신가요?{" "}
                            <Button color="primary" variant="text" size="small">
                                회원가입
                            </Button>
                        </Typography>

                        <Divider>
                            <Typography variant="body2" color="text.secondary">
                                또는
                            </Typography>
                        </Divider>

                        {/* 기존 Grid 사용 - component prop 추가 */}
                        {/* ✅ Grid 대신 Stack 사용 - 완전히 해결! */}
                        <Stack direction="row" spacing={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Google />}
                                sx={{ py: 1.5 }}
                            >
                                Google
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<span>💬</span>}
                                sx={{ py: 1.5 }}
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
