import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

async function ensureUserProfile(user) {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const baseData = {
        email: user.email || "",
        displayName: user.displayName || "",
        updatedAt: serverTimestamp(),
    };

    if (snap.exists()) {
        await setDoc(ref, baseData, { merge: true });
        return;
    }

    await setDoc(ref, {
        ...baseData,
        createdAt: serverTimestamp(),
        reminderNotificationsEnabled: true,
    });
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (nextUser) => {
            try {
                if (nextUser) {
                    await ensureUserProfile(nextUser);
                }
            } catch (error) {
                console.error("Failed to sync user profile", error);
            } finally {
                setUser(nextUser);
                setInitializing(false);
            }
        });
        return unsub;
    }, []);

    const value = useMemo(
        () => ({
            user,
            initializing,
            signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
            signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
            signOutUser: () => signOut(auth),
        }),
        [user, initializing]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
