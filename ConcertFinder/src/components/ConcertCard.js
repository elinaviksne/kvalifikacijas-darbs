import { memo, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles/HomeScreenStyles";

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

const ConcertCard = ({ item }) => {
    const c = useMemo(() => normalizeConcertItem(item), [item]);

    return (
        <View style={styles.card}>
            {c.image ? <Image source={{ uri: c.image }} style={styles.eventImage} /> : null}
            <Text style={styles.eventName}>{c.name}</Text>
            <Text style={styles.eventDate}>{c.date}</Text>
            <Text style={styles.eventVenue}>{c.venue}</Text>
            <TouchableOpacity style={styles.ticketButton} onPress={() => Linking.openURL(c.url)}>
                <Text style={styles.ticketButtonText}>Tickets</Text>
            </TouchableOpacity>
        </View>
    );
};

ConcertCard.propTypes = {
    item: PropTypes.object.isRequired,
};

export default memo(ConcertCard);
