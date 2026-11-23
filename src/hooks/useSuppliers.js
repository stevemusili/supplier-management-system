import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

function useSuppliers() {
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setSuppliers([]);
      setLoading(false);
      return;
    }

    const suppliersQuery = query(
      collection(db, "suppliers"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      suppliersQuery,
      (snapshot) => {
        const supplierData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setSuppliers(supplierData);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load suppliers.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { suppliers, loading, error };
}

export default useSuppliers;