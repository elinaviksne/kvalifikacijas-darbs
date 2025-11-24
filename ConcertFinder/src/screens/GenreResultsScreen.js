import { useEffect, useState } from "react";
import { Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/HomeScreenStyles";
import { fetchConcerts } from "../services/ConcertService";


export default function GenreResultsScreen({ route }) {
    const { genre } = route.params;

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadGenreEvents() {
            const data = await fetchConcerts({ keyword: genre });
            setEvents(data);
            setLoading(false);
        }

        loadGenreEvents();
    }, [genre]);

    if (loading)
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );

    return (
        <SafeAreaView style={styles.container}>

            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {item.image && (
                            <Image
                                source={{ uri: item.image }}
                                style={styles.eventImage}
                                resizeMode="cover"
                            />
                        )}
                        <Text style={styles.eventName}>{item.name}</Text>
                        <Text style={styles.eventDate}>{item.date}</Text>
                        <Text style={styles.eventVenue}>{item.venue}</Text>

                        <TouchableOpacity
                            style={styles.ticketButton}
                            onPress={() => Linking.openURL(item.url)}
                        >
                            <Text style={styles.ticketButtonText}>Tickets</Text>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.list}
            />

        </SafeAreaView>
    );
}
