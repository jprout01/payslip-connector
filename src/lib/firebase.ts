
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCT4xO0gKej6GHLUvwuTTTa_3yzDVG-DCo",
  authDomain: "pay-slip-a858e.firebaseapp.com",
  projectId: "pay-slip-a858e",
  storageBucket: "pay-slip-a858e.firebasestorage.app",
  messagingSenderId: "154785673119",
  appId: "1:154785673119:web:3826b66287e2f3d51c57aa",
  measurementId: "G-1SXLF0HPTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Payslip type definition
export interface Payslip {
  id?: string;
  employeeName: string;
  employeeId: string;
  salary: number;
  month: string;
  year: string;
  paymentDate: Date;
  deductions: number;
  netPay: number;
  taxAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

// Authentication functions
export const createUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Payslip CRUD operations
export const addPayslip = async (payslip: Omit<Payslip, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "payslips"), {
      ...payslip,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId: auth.currentUser?.uid
    });
    
    return {
      id: docRef.id,
      ...payslip,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: auth.currentUser?.uid
    };
  } catch (error) {
    console.error("Error adding payslip: ", error);
    throw error;
  }
};

export const getPayslips = async () => {
  try {
    if (!auth.currentUser) throw new Error("User not authenticated");
    
    const q = query(
      collection(db, "payslips"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const payslips: Payslip[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      payslips.push({
        id: doc.id,
        ...data,
        paymentDate: data.paymentDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Payslip);
    });
    
    return payslips;
  } catch (error) {
    console.error("Error getting payslips: ", error);
    throw error;
  }
};

export const updatePayslip = async (id: string, payslip: Partial<Payslip>) => {
  try {
    const payslipRef = doc(db, "payslips", id);
    await updateDoc(payslipRef, {
      ...payslip,
      updatedAt: Timestamp.now()
    });
    
    return {
      id,
      ...payslip,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error updating payslip: ", error);
    throw error;
  }
};

export const deletePayslip = async (id: string) => {
  try {
    await deleteDoc(doc(db, "payslips", id));
    return id;
  } catch (error) {
    console.error("Error deleting payslip: ", error);
    throw error;
  }
};

export { db, auth, storage };
