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

    async function handleGoogleLogin() {
        setError("");
        setLoading(true);

        try {
            await loginWithGoogle();
            navigate("/dashboard", { replace: true });
        } catch (err) {
            if (err.code !== "auth/popup-closed-by-user") {
                setError("Google sign-in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-blue-900 text-center">
                    Supplier Management System
                </h1>

                <h2 className="text-xl font-semibold text-center mt-4">
                    Welcome Back
                </h2>

                {error && (
                    <p role="alert" className="mt-4 text-red-600">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-1">
                            Email
                        </label>
                        <input 
                            type="email"
                            id="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded border p-3"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block mb-1">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded border p-3"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded bg-blue-900 p-3 text-white disabled:opacity-50"
                    >
                        {loading ? "Please wait..." : "Login"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="mt-4 w-full rounded border p-3 hover:bg-gray-50 disabled:opacity-50"
                >
                    Continue with Google
                </button>

                <p className="mt-6 text-center">
                    No account?{" "}
                    <Link to="/register" className="text-blue-700 font-semibold">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;