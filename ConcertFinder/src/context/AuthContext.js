import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (nextUser) => {
            setUser(nextUser);
            setInitializing(false);
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
