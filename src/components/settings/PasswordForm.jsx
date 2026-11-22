import { useState } from "react";
import { changeUserPassword } from "../../services/profileService";

function PasswordForm({ user }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 10) {
      setError("Use a password with at least 10 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Choose a different password.");
      return;
    }

    setLoading(true);

    try {
      await changeUserPassword(
        user,
        currentPassword,
        newPassword
      );

      setMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Unable to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm p-6 space-y-5"
    >
      <h2 className="text-lg font-semibold">Change Password</h2>

      <div>
        <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block mb-2 text-sm font-medium">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      {message && <p role="status" className="text-green-600">{message}</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}

export default PasswordForm;
