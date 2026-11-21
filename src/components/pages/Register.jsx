import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await register(form.name, form.email, form.password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full m-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-blue-950 text-center">
                    Supplier Management System
                </h1>

                <h2 className="text-xl font-semibold text-center mt-4">
                    Create Account
                </h2>

                {error && (
                    <p role="alert" className="mt-4 text-red-600">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {[
                        { name: "name", label: "Full Name", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "password", label: "Password", type: "password" },
                        {
                            name: "confirmPassword",
                            label: "Confirm Password",
                            type: "password",
                        },
                    ].map((field) => (
                        <div key={field.name}>
                            <label htmlFor={field.name} className="block mb-1">
                                {field.label}
                            </label>
                            <input 
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                required
                                value={form[field.name]}
                                onChange={handleChange}
                                autoComplete={
                                    field.name === "name"
                                    ? "name"
                                    : field.name === "email"
                                    ? "email"
                                    : "new-password"
                                }
                                className="w-full rounded border p-3"
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded bg-blue-900 p-3 text-white disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-700 font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;