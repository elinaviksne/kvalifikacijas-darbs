import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/AccountScreenStyles";

function mapAuthError(error) {
    const code = error?.code;
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/missing-password") return "Please enter your password.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/email-already-in-use") return "This email is already in use.";
    if (code === "auth/invalid-credential") return "Wrong email or password.";
    if (code === "auth/user-not-found") return "No account found for this email.";
    if (code === "auth/wrong-password") return "Wrong email or password.";
    if (code === "auth/network-request-failed") {
        return "Network error. Check internet connection and try again.";
    }
    if (code === "auth/operation-not-allowed") {
        return "Enable Email/Password sign-in in Firebase Authentication settings.";
    }
    const msg = error?.message ? String(error.message) : null;
    if (code || msg) {
        return `Auth error: ${code || "unknown"}${msg ? ` - ${msg}` : ""}`;
    }
    return "Authentication failed. Please try again.";
}

export default function AccountScreen() {
    const { user, initializing, signIn, signUp, signOutUser } = useAuth();
    const tabBarHeight = useBottomTabBarHeight();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleAuth = async (mode) => {
        setError("");
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setError("Email and password are required.");
            return;
        }
        setBusy(true);
        try {
            if (mode === "signin") await signIn(trimmedEmail, password);
            else await signUp(trimmedEmail, password);
            setPassword("");
        } catch (e) {
            console.error("Firebase auth error", e);
            setError(mapAuthError(e));
        } finally {
            setBusy(false);
        }
    };

    const handleSignOut = async () => {
        setError("");
        setBusy(true);
        try {
            await signOutUser();
        } catch (e) {
            console.error("Firebase sign out error", e);
            setError(mapAuthError(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={[styles.card, { marginBottom: tabBarHeight + 20 }]}>
                    <Text style={styles.title}>Account</Text>
                    <Text style={styles.subtitle}>
                        Browse as guest anytime. Sign in only if you want to save concerts and reminders.
                    </Text>

                    {initializing ? (
                        <ActivityIndicator size="small" color="#FF6F00" />
                    ) : user ? (
                        <View style={styles.loggedInSection}>
                            <Text style={styles.loggedInLabel}>Signed in as</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryButton]}
                                onPress={handleSignOut}
                                disabled={busy}
                            >
                                <Text style={styles.actionButtonText}>
                                    {busy ? "Signing out..." : "Sign out"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#888"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password (min 6 chars)"
                                placeholderTextColor="#888"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleAuth("signin")}
                                disabled={busy}
                            >
                                <Text style={styles.actionButtonText}>
                                    {busy ? "Please wait..." : "Sign in"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryButton]}
                                onPress={() => handleAuth("signup")}
                                disabled={busy}
                            >
                                <Text style={styles.actionButtonText}>Create account</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
