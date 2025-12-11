import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import ConcertCard from "../components/ConcertCard";
import { fetchConcerts } from "../services/ConcertService";
import styles from "../styles/HomeScreenStyles";

export default function GenreResultsScreen({ route }) {
    const { genre } = route.params;

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        setEvents([]);

        async function loadGenreEvents() {
            // Iegūst koncertus no API pēc izvēlētā žanra
            const data = await fetchConcerts({ keyword: genre });
            if (isMounted) {
                setEvents(data);
                setLoading(false);
            }
        }

        loadGenreEvents();

        return () => { isMounted = false; };
    }, [genre]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* Saraksts ar koncertiem */}
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
