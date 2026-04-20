import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { collection, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
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

function profileFromUser(user) {
    if (!user?.email) {
        return { displayName: "Guest", username: "@guest", initials: "G" };
    }
    const local = user.email.split("@")[0] || "user";
    const cleaned = local.replace(/[._-]+/g, " ").trim();
    const displayName =
        cleaned.length > 0
            ? cleaned
                  .split(" ")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ")
            : "User";
    const initials = displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return {
        displayName,
        username: `@${local.toLowerCase()}`,
        initials: initials || "U",
    };
}

export default function AccountScreen() {
    const { user, initializing, signIn, signUp, signOutUser } = useAuth();
    const tabBarHeight = useBottomTabBarHeight();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [savedConcerts, setSavedConcerts] = useState([]);
    const [savedLoading, setSavedLoading] = useState(false);
    const [savedError, setSavedError] = useState("");
    const [removingId, setRemovingId] = useState("");
    const profile = profileFromUser(user);

    useEffect(() => {
        if (!user?.uid) {
            setSavedConcerts([]);
            setSavedLoading(false);
            setSavedError("");
            return undefined;
        }

        setSavedLoading(true);
        setSavedError("");
        const savedRef = collection(db, "users", user.uid, "savedConcerts");
        const unsubscribe = onSnapshot(
            query(savedRef),
            (snapshot) => {
                const next = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                }));
                setSavedConcerts(next);
                setSavedLoading(false);
            },
            (snapshotError) => {
                console.error("Failed to load saved concerts", snapshotError);
                setSavedError("Could not load saved concerts.");
                setSavedLoading(false);
            }
        );
        return unsubscribe;
    }, [user?.uid]);

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

    const handleRemoveSavedConcert = async (concertId) => {
        if (!user?.uid || !concertId || removingId) return;
        setRemovingId(concertId);
        try {
            await deleteDoc(doc(db, "users", user.uid, "savedConcerts", concertId));
        } catch (removeError) {
            console.error("Failed to remove saved concert", removeError);
            Alert.alert("Remove failed", "Could not remove concert right now. Please try again.");
        } finally {
            setRemovingId("");
        }
    };

    return (
        <View style={styles.statusBarFill}>
            <SafeAreaView style={styles.safeTransparent} edges={["top", "left", "right"]}>
                <View style={styles.accountNavBar}>
                    <Text style={styles.accountNavTitle}>Account</Text>
                </View>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: tabBarHeight + 20 },
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.card}>
                            {!user ? (
                                <Text style={styles.subtitle}>
                                    Browse as guest anytime. Sign in only if you want to save concerts and reminders.
                                </Text>
                            ) : null}

                            {initializing ? (
                                <ActivityIndicator size="small" color="#FF6F00" />
                            ) : user ? (
                                <View style={styles.loggedInSection}>
                                    <View style={styles.profileHeader}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{profile.initials}</Text>
                                        </View>
                                        <Text style={styles.displayName}>{profile.displayName}</Text>
                                        <Text style={styles.username}>{profile.username}</Text>
                                        <TouchableOpacity style={styles.editButton} disabled={busy}>
                                            <Text style={styles.editButtonText}>Edit account</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.savedConcertsSection}>
                                        <Text style={styles.savedTitle}>Saved concerts</Text>
                                        {savedLoading ? (
                                            <View style={styles.savedConcertsPlaceholder}>
                                                <ActivityIndicator size="small" color="#FF6F00" />
                                            </View>
                                        ) : savedError ? (
                                            <View style={styles.savedConcertsPlaceholder}>
                                                <Text style={styles.savedPlaceholderText}>{savedError}</Text>
                                            </View>
                                        ) : savedConcerts.length === 0 ? (
                                            <View style={styles.savedConcertsPlaceholder}>
                                                <Text style={styles.savedPlaceholderText}>
                                                    Your saved concerts will appear here.
                                                </Text>
                                            </View>
                                        ) : (
                                            <View style={styles.savedConcertsList}>
                                                {savedConcerts.map((concert) => (
                                                    <View key={concert.id} style={styles.savedConcertItem}>
                                                        <View style={styles.savedConcertRow}>
                                                            <View style={styles.savedConcertTextCol}>
                                                                <Text
                                                                    style={styles.savedConcertName}
                                                                    numberOfLines={2}
                                                                >
                                                                    {concert.name || "Untitled concert"}
                                                                </Text>
                                                                <Text style={styles.savedConcertMeta}>
                                                                    {concert.date || "Date TBD"}
                                                                </Text>
                                                                <Text
                                                                    style={styles.savedConcertMeta}
                                                                    numberOfLines={1}
                                                                >
                                                                    {concert.venue || "Venue TBD"}
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                style={styles.removeSavedButton}
                                                                onPress={() =>
                                                                    handleRemoveSavedConcert(concert.id)
                                                                }
                                                                disabled={removingId === concert.id}
                                                            >
                                                                <Text style={styles.removeSavedButtonText}>
                                                                    {removingId === concert.id
                                                                        ? "..."
                                                                        : "Remove"}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>

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
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
