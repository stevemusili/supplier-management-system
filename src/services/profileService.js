import { updateProfile, verifyBeforeUpdateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/config";

// read the user's profile from Firestore
export async function getUserProfile(userId) {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  return snapshot.exists() ? snapshot.data() : {};
}

// update name and company
export async function saveUserProfile(user, data) {
  if (!user) throw new Error("You must be logged in.");

  const fullName = data.fullName.trim();
  const company = data.company.trim();

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  await updateProfile(user, {
    displayName: fullName,
  });

  await setDoc(
    doc(db, "users", user.uid),
    {
      fullName,
      company,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// verify current password for sensitive changes
async function verifyCurrentPassword(user, currentPassword) {
  if (!user?.email) {
    throw new Error("No email is associated with this account.");
  }

  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );

  await reauthenticateWithCredential(user, credential);
}

// Request a verified email change
export async function changeUserEmail(
  user,
  newEmail,
  currentPassword
) {
  if (!user) throw new Error("You must be logged in.");

  await verifyCurrentPassword(user, currentPassword);

  await verifyBeforeUpdateEmail(
    user,
    newEmail.trim()
  );
}

// change the account password
export async function changeUserPassword(
  user,
  currentPassword,
  newPassword
) {
  if (!user) throw new Error("You must be logged in.");

  await verifyCurrentPassword(user, currentPassword);
  await updatePassword(user, newPassword);
}