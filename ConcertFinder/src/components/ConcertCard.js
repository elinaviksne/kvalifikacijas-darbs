import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, Linking, Alert } from "react-native";
import PropTypes from "prop-types";
import { Ionicons } from "@expo/vector-icons";
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import styles from "../styles/HomeScreenStyles";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

function pickLocale(obj) {
    if (!obj || typeof obj !== "object") return null;
    for (const key of ["en", "lv", "ru"]) {
        const v = obj[key];
        if (typeof v === "string" && v.trim()) return v;
    }
    return null;
}

function isBilesuParadizeItem(item) {
    return typeof item.id === "string" && item.id.startsWith("bp-");
}

function firstBilesuImage(event) {
    const p = event.performance;
    for (const o of [
        p?.posterImageUrls,
        p?.standardImageUrls,
        p?.smallImageUrls,
        p?.mobileImageUrls,
        event.posterImageUrls,
        event.standardImageUrls,
        event.smallImageUrls,
        event.mobileImageUrls,
    ]) {
        const u = pickLocale(o);
        if (u?.trim()) return u;
    }
    return null;
}

/**
 * Vieno Ticketmaster ierakstu (plakans objekts) un Biļešu Paradīzes API atbildi (id ar prefiksu `bp-`).
 */
function normalizeConcertItem(item) {
    if (isBilesuParadizeItem(item)) {
        const numericId = String(item.id).replace(/^bp-/, "");
        const addr = item.hall?.address;
        return {
            name: pickLocale(item.performance?.titles) || `Event ${numericId}`,
            date: item.dateTime ? item.dateTime.slice(0, 10) : "",
            venue:
                pickLocale(item.venue?.titles) ||
                pickLocale(item.hall?.titles) ||
                (typeof addr === "string" ? addr : null) ||
                "Biļešu Paradīze",
            url: pickLocale(item.urls) || `https://www.bilesuparadize.lv/en/event/${numericId}`,
            image: firstBilesuImage(item),
        };
    }
    return {
        name: item.name,
        date: item.date,
        venue: item.venue,
        url: item.url,
        image: item.image,
    };
}

/** Saraksta kārtošanai: datums no abiem datu avotiem. */
export function getConcertSortDate(item) {
    if (isBilesuParadizeItem(item)) return item.dateTime?.slice(0, 10) || "";
    return item.date || "";
}

function getConcertDocumentId(item) {
    return encodeURIComponent(String(item.id));
}

async function withTimeout(promise, ms) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error("timeout"));
        }, ms);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
    }
}

const ConcertCard = ({ item }) => {
    const { user } = useAuth();
    const c = useMemo(() => normalizeConcertItem(item), [item]);
    const [saved, setSaved] = useState(false);
    const [saveBusy, setSaveBusy] = useState(false);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        let active = true;
        if (!user?.uid) {
            setSaved(false);
            setFeedback("");
            return undefined;
        }

        const ref = doc(
            db,
            "users",
            user.uid,
            "savedConcerts",
            getConcertDocumentId(item)
        );
        const unsubscribe = onSnapshot(
            ref,
            (snap) => {
                if (!active) return;
                setSaved(snap.exists());
                setFeedback("");
            },
            () => {
                if (active) {
                    setSaved(false);
                }
            }
        );

        return () => {
            active = false;
            unsubscribe();
        };
    }, [item, user?.uid]);

    useEffect(() => {
        if (!feedback) return undefined;
        const timer = setTimeout(() => setFeedback(""), 2200);
        return () => clearTimeout(timer);
    }, [feedback]);

    const toggleSave = useCallback(async () => {
        if (!user?.uid) {
            setFeedback("Sign in to save concerts.");
            Alert.alert("Sign in required", "Create an account or sign in to save concerts.");
            return;
        }
        if (saveBusy) return;

        setFeedback(saved ? "Removing..." : "Saving...");
        setSaveBusy(true);
        const ref = doc(
            db,
            "users",
            user.uid,
            "savedConcerts",
            getConcertDocumentId(item)
        );

        try {
            if (saved) {
                await withTimeout(deleteDoc(ref), 10000);
                setSaved(false);
                setFeedback("Removed from saved concerts.");
                Alert.alert("Removed", "Concert removed from saved concerts.");
            } else {
                await withTimeout(
                    setDoc(ref, {
                    concertId: String(item.id),
                    name: c.name,
                    date: c.date || "",
                    venue: c.venue || "",
                    url: c.url || "",
                    image: c.image || null,
                    reminderAt: null,
                    reminderEnabled: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    }),
                    10000
                );
                setSaved(true);
                setFeedback("Saved for reminders.");
                Alert.alert("Saved", "Concert saved for reminders.");
            }
        } catch (error) {
            console.error("Save concert error", error);
            if (error?.message === "timeout") {
                setFeedback("Save timed out. Check internet/firestore setup and try again.");
                Alert.alert(
                    "Save timed out",
                    "Could not reach Firestore in time. Check internet and Firestore setup."
                );
            } else if (error?.code === "permission-denied") {
                setFeedback("Permission denied. Firestore rules need to allow this user.");
                Alert.alert(
                    "Permission denied",
                    "Your Firestore rules currently block saving. I can help you fix the rules."
                );
            } else if (error?.code === "failed-precondition") {
                setFeedback("Enable Firestore Database in Firebase Console first.");
                Alert.alert(
                    "Enable Firestore",
                    "Create Firestore Database in Firebase Console first."
                );
            } else {
                setFeedback("Could not save. Please try again.");
                Alert.alert("Save failed", "Could not save this concert. Please try again.");
            }
        } finally {
            setSaveBusy(false);
        }
    }, [c.date, c.image, c.name, c.url, c.venue, item, saveBusy, saved, user?.uid]);

    return (
        <View style={styles.card}>
            {c.image ? <Image source={{ uri: c.image }} style={styles.eventImage} /> : null}
            <Text style={styles.eventName}>{c.name}</Text>
            <Text style={styles.eventDate}>{c.date}</Text>
            <Text style={styles.eventVenue}>{c.venue}</Text>
            <View style={styles.cardActionRow}>
                <TouchableOpacity
                    style={styles.ticketButton}
                    onPress={() => Linking.openURL(c.url)}
                >
                    <Text style={styles.ticketButtonText}>Tickets</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveButton, saved && styles.saveButtonActive]}
                    onPress={toggleSave}
                    disabled={saveBusy}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={saveBusy ? "hourglass-outline" : saved ? "checkmark" : "add"}
                        size={22}
                        color={saved ? "#111" : "#fff"}
                    />
                </TouchableOpacity>
            </View>
            {feedback ? <Text style={styles.saveFeedbackText}>{feedback}</Text> : null}
        </View>
    );
};

ConcertCard.propTypes = {
    item: PropTypes.object.isRequired,
};

export default memo(ConcertCard);
