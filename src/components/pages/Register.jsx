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
        <div>
            <div>
                <h1>
                    Supplier Management System
                </h1>

                <h2>
                    Create Account
                </h2>

                {error && (
                    <p role="alert">

                    </p>
                )}

                <form onSubmit={handleSubmit}>
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
                            <label htmlFor={field.name}>
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
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;