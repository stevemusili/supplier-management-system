import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            await login(email, password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError("Unable to log in. Check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div>
                <h1>
                    Supplier Management System
                </h1>

                <h2>
                    Welcome Back
                </h2>

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email">
                            Email
                        </label>
                        <input 
                            type="email"
                            id="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : "Login"}
                    </button>
                </form>

                <p>
                    No account?{""}
                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;