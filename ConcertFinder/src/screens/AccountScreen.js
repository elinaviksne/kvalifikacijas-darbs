import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Alert, KeyboardAvoidingView, PanResponder, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { collection, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { cancelConcertReminder } from "../services/ReminderService";
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
    if (code === "auth/requires-recent-login") {
        return "For security reasons, please sign out and sign back in before updating account details.";
    }
    if (code === "auth/email-already-exists") {
        return "This email is already used by another account.";
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
    const cleaned = (user.displayName || local).replace(/[._-]+/g, " ").trim();
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

const SWIPE_DELETE_WIDTH = 104;
const SWIPE_OPEN_THRESHOLD = 52;

function SwipeToDeleteRow({ children, onDelete, deleting }) {
    const translateX = useRef(new Animated.Value(0)).current;
    const openRef = useRef(false);

    const animateTo = (toValue) => {
        Animated.spring(translateX, {
            toValue,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
        }).start();
        openRef.current = toValue < 0;
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) =>
                Math.abs(gestureState.dx) > 8 &&
                Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
            onPanResponderGrant: () => {
                translateX.stopAnimation();
            },
            onPanResponderMove: (_, gestureState) => {
                const rawDx = openRef.current ? gestureState.dx - SWIPE_DELETE_WIDTH : gestureState.dx;
                const clampedDx = Math.min(0, Math.max(-SWIPE_DELETE_WIDTH, rawDx));
                translateX.setValue(clampedDx);
            },
            onPanResponderRelease: (_, gestureState) => {
                const shouldOpen =
                    gestureState.dx < -SWIPE_OPEN_THRESHOLD ||
                    (openRef.current && gestureState.dx < SWIPE_OPEN_THRESHOLD);
                animateTo(shouldOpen ? -SWIPE_DELETE_WIDTH : 0);
            },
            onPanResponderTerminate: () => {
                animateTo(openRef.current ? -SWIPE_DELETE_WIDTH : 0);
            },
        })
    ).current;

    return (
        <View style={styles.swipeItemContainer}>
            <View style={styles.swipeDeleteBackground}>
                <TouchableOpacity
                    style={styles.swipeDeleteAction}
                    onPress={onDelete}
                    disabled={deleting}
                >
                    <Text style={styles.swipeDeleteActionText}>
                        {deleting ? "Removing..." : "Delete"}
                    </Text>
                </TouchableOpacity>
            </View>
            <Animated.View
                style={[styles.swipeFrontRow, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
}

export default function AccountScreen() {
    const { user, initializing, signIn, signUp, signOutUser, updateAccount } = useAuth();
    const tabBarHeight = useBottomTabBarHeight();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [savedConcerts, setSavedConcerts] = useState([]);
    const [savedLoading, setSavedLoading] = useState(false);
    const [savedError, setSavedError] = useState("");
    const [removingId, setRemovingId] = useState("");
    const [editingAccount, setEditingAccount] = useState(false);
    const [editDisplayName, setEditDisplayName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [savingAccount, setSavingAccount] = useState(false);
    const profile = profileFromUser(user);

    useEffect(() => {
        if (!user) {
            setEditingAccount(false);
            setEditDisplayName("");
            setEditEmail("");
            return;
        }
        setEditDisplayName(user.displayName || "");
        setEditEmail(user.email || "");
    }, [user]);

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

    const handleRemoveSavedConcert = async (concertId, reminderNotificationId) => {
        if (!user?.uid || !concertId || removingId) return;
        setRemovingId(concertId);
        try {
            await cancelConcertReminder(reminderNotificationId);
            await deleteDoc(doc(db, "users", user.uid, "savedConcerts", concertId));
        } catch (removeError) {
            console.error("Failed to remove saved concert", removeError);
            Alert.alert("Remove failed", "Could not remove concert right now. Please try again.");
        } finally {
            setRemovingId("");
        }
    };

    const handleSaveAccount = async () => {
        setError("");
        if (!user) return;

        const nextName = editDisplayName.trim();
        const nextEmail = editEmail.trim();

        if (!nextEmail) {
            setError("Email cannot be empty.");
            return;
        }

        setSavingAccount(true);
        try {
            await updateAccount({ displayName: nextName, email: nextEmail });
            setEditingAccount(false);
            Alert.alert("Updated", "Your account details were saved.");
        } catch (e) {
            console.error("Account update error", e);
            setError(mapAuthError(e));
        } finally {
            setSavingAccount(false);
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
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            disabled={busy || savingAccount}
                                            onPress={() => {
                                                if (editingAccount) {
                                                    setEditingAccount(false);
                                                    setEditDisplayName(user?.displayName || "");
                                                    setEditEmail(user?.email || "");
                                                } else {
                                                    setEditingAccount(true);
                                                }
                                            }}
                                        >
                                            <Text style={styles.editButtonText}>
                                                {editingAccount ? "Cancel" : "Edit account"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {editingAccount ? (
                                        <View style={styles.editAccountCard}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Display name"
                                                placeholderTextColor="#888"
                                                value={editDisplayName}
                                                onChangeText={setEditDisplayName}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Email"
                                                placeholderTextColor="#888"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={editEmail}
                                                onChangeText={setEditEmail}
                                            />
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={handleSaveAccount}
                                                disabled={savingAccount}
                                            >
                                                <Text style={styles.actionButtonText}>
                                                    {savingAccount ? "Saving..." : "Save account"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : null}

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
                                                    <SwipeToDeleteRow
                                                        key={concert.id}
                                                        deleting={removingId === concert.id}
                                                        onDelete={() =>
                                                            handleRemoveSavedConcert(
                                                                concert.id,
                                                                concert.reminderNotificationId
                                                            )
                                                        }
                                                    >
                                                        <View style={styles.savedConcertItem}>
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
                                                            </View>
                                                        </View>
                                                    </SwipeToDeleteRow>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.secondaryButton]}
                                    onPress={handleSignOut}
                                    disabled={busy || savingAccount}
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
