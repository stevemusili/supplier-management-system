import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const suppliersCollection = collection(db, "suppliers");

// add a supplier
export async function addSupplier(data, userId) {
    if (!userId) {
        throw new Error("You must be logged in.");
    }

    return await addDoc(suppliersCollection, {
        ...data,
        ownerId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });  
}

// get a supplier by ID
export async function getSupplierById(id, userId) {
    const supplierRef = doc(db, "suppliers", id);
    const snapshot = await getDoc(supplierRef);

    if (!snapshot.exists()) {
        throw new Error("Supplier not found.");
    }

    if (snapshot.data().ownerId !== userId) {
        throw new Error("You cannot access this supplier.");
    }

    return {
        id: snapshot.id,
        ...snapshot.data(),
    };
}

// update a supplier
export async function updateSupplier(id, data) {
    const supplierRef = doc(db, "suppliers", id);

    return await updateDoc(supplierRef, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        category: data.category,
        status: data.status,
        updatedAt: serverTimestamp(),
    });
}

// delete a supplier
export async function deleteSupplier(id) {
    const supplierRef = doc(db, "suppliers", id);
    return await deleteDoc(supplierRef); 
}