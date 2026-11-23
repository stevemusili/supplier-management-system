import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

function useCategories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const categoriesQuery = query(
      collection(db, "categories"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const categoryData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setCategories(categoryData);
        setLoading(false);
      },
      (err) => {
        console.error("Category fetch error:", err);
        setError("Failed to load categories.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { categories, loading, error };
}

export default useCategories;