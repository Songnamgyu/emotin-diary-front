// App.tsx (Route만 사용 - Link 없음)
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// 임시 페이지들
const SignupPage = () => (
    <div>
        <h2>회원가입 페이지</h2>
    </div>
);
const DashboardPage = () => (
    <div>
        <h2>대시보드 페이지</h2>
    </div>
);

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <div style={{ padding: "20px" }}>
                    <h1>감정 일기 앱</h1>

                    {/* Route만 있으면 됨 - Link는 선택사항 */}
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/login" replace />}
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="*"
                            element={<Navigate to="/login" replace />}
                        />
                    </Routes>
                </div>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
