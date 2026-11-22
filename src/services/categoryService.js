import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/config";

const categoriesCollection = collection(db, "categories");

// create a category
export async function addCategory(data, userId) {
  if (!userId) {
    throw new Error("You must be logged in.");
  }

  return await addDoc(categoriesCollection, {
    name: data.name.trim(),
    description: data.description.trim(),
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// update a category
export async function updateCategory(id, data) {
  const categoryRef = doc(db, "categories", id);

  return await updateDoc(categoryRef, {
    name: data.name.trim(),
    description: data.description.trim(),
    updatedAt: serverTimestamp(),
  });
}

// delete a category
export async function deleteCategory(id) {
  const categoryRef = doc(db, "categories", id);
  return await deleteDoc(categoryRef);
}