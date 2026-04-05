import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import ConcertCard, { getConcertSortDate } from "../components/ConcertCard";
import { fetchConcerts, fetchBilesuParadizeConcerts } from "../services/ConcertService";
import styles from "../styles/HomeScreenStyles";

export default function HomeScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const tabBarHeight = useBottomTabBarHeight();

    useEffect(() => {
        let isMounted = true;

        async function loadEvents() {
            setLoading(true);
            setEvents([]);

            try {
                // BP neprasa atrašanās vietu — sākt tūlīt, kamēr gaida atļauju un GPS.
                const bilesuPromise = fetchBilesuParadizeConcerts();

                const { status } = await Location.requestForegroundPermissionsAsync();
                let ticketmaster = [];
                if (status === 'granted') {
                    let coords = null;
                    const last = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
                    if (last?.coords) {
                        coords = last.coords;
                    } else {
                        const location = await Location.getCurrentPositionAsync({});
                        coords = location.coords;
                    }
                    ticketmaster = await fetchConcerts({ keyword: 'rock', latlong: coords });
                } else {
                    console.warn("Location permission denied");
                }

                const bilesu = await bilesuPromise;
                const merged = [...bilesu, ...ticketmaster].sort((a, b) =>
                    getConcertSortDate(a).localeCompare(getConcertSortDate(b))
                );

                if (isMounted) {
                    setEvents(merged);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching concerts:", error);
                setLoading(false);
            }
        }

        loadEvents();

        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );
    }

    if (events.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white' }}>No concerts found near you.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ConcertCard item={item} />}
                contentContainerStyle={[styles.list, { paddingBottom: 32 + tabBarHeight }]}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </View>
    );
}