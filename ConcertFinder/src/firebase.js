import { getApp, getApps, initializeApp } from "firebase/app";
import { Platform } from "react-native";
import {
    getAuth,
    getReactNativePersistence,
    inMemoryPersistence,
    initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
let warnedAboutAuthPersistence = false;

function loadReactNativeAuthStorage() {
    try {
        const storageModule = require("@react-native-async-storage/async-storage");
        if (typeof storageModule.createAsyncStorage === "function") {
            return storageModule.createAsyncStorage("concertfinder-auth");
        }
        return storageModule.default || storageModule;
    } catch {
        return null;
    }
}

function getFirebaseAuth() {
    if (Platform.OS === "web") {
        return getAuth(app);
    }

    const initInMemoryAuth = () => {
        try {
            return initializeAuth(app, { persistence: inMemoryPersistence });
        } catch {
            return getAuth(app);
        }
    };

    const storage = loadReactNativeAuthStorage();
    if (!storage) {
        if (!warnedAboutAuthPersistence) {
            warnedAboutAuthPersistence = true;
            console.warn(
                "AsyncStorage native module unavailable. Falling back to memory auth persistence."
            );
        }
        return initInMemoryAuth();
    }

    try {
        return initializeAuth(app, {
            persistence: getReactNativePersistence(storage),
        });
    } catch (error) {
        if (error?.code !== "auth/already-initialized" && !warnedAboutAuthPersistence) {
            warnedAboutAuthPersistence = true;
            console.warn(
                "Firebase auth persistence fallback activated:",
                error?.message || error
            );
        }
        return initInMemoryAuth();
    }
}

export const auth = getFirebaseAuth();
export const db = getFirestore(app);

export default app;
