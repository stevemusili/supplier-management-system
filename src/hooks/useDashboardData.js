import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

function useDashboardData() {
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setSuppliers([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    let suppliersReady = false;
    let categoriesReady = false;

    function checkLoading() {
      if (suppliersReady && categoriesReady) {
        setLoading(false);
      }
    }

    const suppliersQuery = query(
      collection(db, "suppliers"),
      where("ownerId", "==", user.uid)
    );

    const categoriesQuery = query(
      collection(db, "categories"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribeSuppliers = onSnapshot(
      suppliersQuery,
      (snapshot) => {
        setSuppliers(
          snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );

        suppliersReady = true;
        checkLoading();
      },
      (err) => {
        console.error("Supplier fetch error:", err);
        setError("Unable to load dashboard data.");
        suppliersReady = true;
        checkLoading();
      }
    );

    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        setCategories(
          snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );

        categoriesReady = true;
        checkLoading();
      },
      (err) => {
        console.error("Category fetch error:", err);
        setError("Unable to load dashboard data.");
        categoriesReady = true;
        checkLoading();
      }
    );

    return () => {
      unsubscribeSuppliers();
      unsubscribeCategories();
    };
  }, [user?.uid]);

  return { suppliers, categories, loading, error };
}

export default useDashboardData;