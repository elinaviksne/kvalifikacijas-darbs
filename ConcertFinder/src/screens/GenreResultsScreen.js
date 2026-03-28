import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import ConcertCard, { getConcertSortDate } from "../components/ConcertCard";
import {
    fetchConcerts,
    fetchBilesuParadizeForGenre,
    genreIdFromLabel,
} from "../services/ConcertService";
import styles from "../styles/HomeScreenStyles";

export default function GenreResultsScreen({ route }) {
    const { genre, genreId: genreIdParam } = route.params;
    const genreId = genreIdParam ?? genreIdFromLabel(genre);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        setEvents([]);

        async function loadGenreEvents() {
            const [ticketmaster, bilesu] = await Promise.all([
                fetchConcerts({ keyword: genre }),
                fetchBilesuParadizeForGenre(genreId),
            ]);
            const merged = [...bilesu, ...ticketmaster].sort((a, b) =>
                getConcertSortDate(a).localeCompare(getConcertSortDate(b))
            );
            if (isMounted) {
                setEvents(merged);
                setLoading(false);
            }
        }

        loadGenreEvents();

        return () => { isMounted = false; };
    }, [genre, genreId]);

    if (loading) {
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
                contentContainerStyle={styles.list}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </View>
    );
}
