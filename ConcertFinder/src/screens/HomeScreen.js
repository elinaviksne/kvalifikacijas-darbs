import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import * as Location from "expo-location";
import ConcertCard, { getConcertSortDate } from "../components/ConcertCard";
import { fetchConcerts, fetchBilesuParadizeConcerts } from "../services/ConcertService";
import styles from "../styles/HomeScreenStyles";

export default function HomeScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadEvents() {
            setLoading(true);
            setEvents([]);

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.warn("Location permission denied");
                    setLoading(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                // Paralēli: Ticketmaster pēc ģeolokācijas + Biļešu Paradīze; apvieno un kārtot pēc datuma.
                const [ticketmaster, bilesu] = await Promise.all([
                    fetchConcerts({ keyword: 'rock', latlong: location.coords }),
                    fetchBilesuParadizeConcerts(),
                ]);

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
                contentContainerStyle={styles.list}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </View>
    );
}