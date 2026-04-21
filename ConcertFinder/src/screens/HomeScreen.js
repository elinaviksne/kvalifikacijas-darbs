import { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    Text,
    RefreshControl,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import ConcertCard, { getConcertSortDate } from "../components/ConcertCard";
import { fetchConcerts, fetchBilesuParadizeConcerts } from "../services/ConcertService";
import styles from "../styles/HomeScreenStyles";

const REFRESH_COLORS = ["#FF6F00"];

/** `getCurrentPositionAsync` can hang indefinitely on some Android builds / emulators without a fix. */
const CURRENT_POSITION_TIMEOUT_MS = 18_000;

function withTimeout(promise, ms, label) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export default function HomeScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const tabBarHeight = useBottomTabBarHeight();
    const mounted = useRef(true);
    const loadIdRef = useRef(0);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const loadEvents = useCallback(async (isRefresh) => {
        const loadId = ++loadIdRef.current;
        const isStale = () => !mounted.current || loadId !== loadIdRef.current;

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
            setEvents([]);
        }

        try {
            const bilesuPromise = fetchBilesuParadizeConcerts();

            const { status } = await Location.requestForegroundPermissionsAsync();
            let ticketmaster = [];
            if (status === "granted") {
                let coords = null;
                const last = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
                if (last?.coords) {
                    coords = last.coords;
                } else {
                    try {
                        const location = await withTimeout(
                            Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.Balanced,
                            }),
                            CURRENT_POSITION_TIMEOUT_MS,
                            "getCurrentPositionAsync"
                        );
                        coords = location.coords;
                    } catch (e) {
                        console.warn("Home: could not get GPS fix; showing Biļešu Paradīze only.", e?.message ?? e);
                    }
                }
                if (coords) {
                    ticketmaster = await fetchConcerts({ keyword: "rock", latlong: coords });
                }
            } else {
                console.warn("Location permission denied");
            }

            const bilesu = await bilesuPromise;
            const merged = [...bilesu, ...ticketmaster].sort((a, b) =>
                getConcertSortDate(a).localeCompare(getConcertSortDate(b))
            );

            if (!isStale()) {
                setEvents(merged);
            }
        } catch (error) {
            console.error("Error fetching concerts:", error);
        } finally {
            if (!isStale()) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        loadEvents(false);
    }, [loadEvents]);

    if (loading && events.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ConcertCard item={item} />}
                contentContainerStyle={[
                    styles.list,
                    { paddingBottom: 32 + tabBarHeight },
                    events.length === 0 && { flexGrow: 1 },
                ]}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadEvents(true)}
                        tintColor="#FF6F00"
                        colors={REFRESH_COLORS}
                    />
                }
                ListEmptyComponent={
                    <Text style={{ color: "white", textAlign: "center", marginTop: 24 }}>
                        No concerts found near you.
                    </Text>
                }
            />
        </View>
    );
}
