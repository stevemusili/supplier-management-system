import { useEffect, useState } from "react";
import { saveUserProfile } from "../../services/profileService";

function ProfileForm({ user, profile, onSaved }) {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFullName(profile.fullName || user.displayName || "");
    setCompany(profile.company || "");
  }, [profile, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await saveUserProfile(user, { fullName, company });
      await onSaved();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm p-6 space-y-5"
    >
      <h2 className="text-lg font-semibold">Profile Information</h2>

      <div>
        <label htmlFor="fullName" className="block mb-2 text-sm font-medium">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      <div>
        <label htmlFor="company" className="block mb-2 text-sm font-medium">
          Company Name
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      {message && <p role="status" className="text-green-600">{message}</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

export default ProfileForm;