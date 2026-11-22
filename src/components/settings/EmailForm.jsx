import { useState } from "react";
import { changeUserEmail } from "../../services/profileService";

function EmailForm({ user }) {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (
        newEmail.trim().toLowerCase() ===
        user.email?.toLowerCase()
      ) {
        throw new Error("Enter a different email address.");
      }

      await changeUserEmail(
        user,
        newEmail,
        currentPassword
      );

      setMessage(
        "Verification email sent. Open the link in your new email inbox to complete the change."
      );
      setCurrentPassword("");
      setNewEmail("");
    } catch (err) {
      setError(err.message || "Unable to update email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm p-6 space-y-5"
    >
      <h2 className="text-lg font-semibold">Email Address</h2>

      <p className="text-sm text-gray-600">
        Current email: {user.email}
      </p>

      <div>
        <label htmlFor="newEmail" className="block mb-2 text-sm font-medium">
          New Email
        </label>
        <input
          id="newEmail"
          type="email"
          required
          autoComplete="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      <div>
        <label htmlFor="emailPassword" className="block mb-2 text-sm font-medium">
          Current Password
        </label>
        <input
          id="emailPassword"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      {message && <p role="status" className="text-green-600">{message}</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Sending..." : "Update Email"}
      </button>
    </form>
  );
}

export default EmailForm;