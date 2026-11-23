import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/profileService";

import ProfileForm from "../settings/ProfileForm";
import EmailForm from "../settings/EmailForm";
import PasswordForm from "../settings/PasswordForm";

function Settings() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setError("");
      const data = await getUserProfile(user.uid);
      setProfile(data);
    } catch (err) {
      setError(err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-red-600">
        {error}
      </p>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your profile and account security.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">
            Account Overview
          </h2>

          <p className="mb-2">
            <strong>Name:</strong>{" "}
            {profile.fullName || user.displayName || "Not set"}
          </p>

          <p className="mb-2">
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Company:</strong>{" "}
            {profile.company || "Not set"}
          </p>
        </div>

        <ProfileForm
          user={user}
          profile={profile}
          onSaved={loadProfile}
        />

        <EmailForm user={user} />

        <PasswordForm user={user} />
      </div>
    </div>
  );
}

export default Settings;