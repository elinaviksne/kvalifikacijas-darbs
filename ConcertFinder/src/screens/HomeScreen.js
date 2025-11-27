import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import * as Location from "expo-location";
import ConcertCard from "../components/ConcertCard";
import { fetchConcerts } from "../services/ConcertService";
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
                // Pieprasa lietotāja atrašanās vietas atļauju
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.warn("Location permission denied");
                    setLoading(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                const data = await fetchConcerts({ keyword: 'rock', latlong: location.coords });

                if (isMounted) {
                    setEvents(data);
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

    // Rāda ielādes indikatoru, kamēr dati tiek ielādēti
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );
    }

    // Ja nav atrasti koncerti
    if (events.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white' }}>No concerts found near you.</Text>
            </View>
        );
    }

    // Rāda koncertu sarakstu
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