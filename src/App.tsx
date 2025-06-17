import "./App.css";
import LoginPage from "./pages/auth/LoginPage";

function App() {
    // const { isAuthenticated } = useAuth();

    return (
        <div className="App">
            <LoginPage />
            {/* {isAuthenticated ? <Dashboard /> : <LoginPage />} */}
        </div>
    );
}

export default App;
