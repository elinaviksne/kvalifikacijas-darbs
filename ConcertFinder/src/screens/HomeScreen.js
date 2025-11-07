import { useEffect, useState, useCallback } from "react";
import { Linking, Text, View, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/HomeScreenStyles";
import { fetchConcerts } from "../services/ConcertService";

export default function HomeScreen() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function loadEvents() {
            const data = await fetchConcerts({ keyword: "rock", city: "New York" });
            if (isMounted) setEvents(data);
        }

        loadEvents();
        return () => {
            isMounted = false;
        };
    }, []);

    const renderEvent = useCallback(({ item }) => (
        <View style={styles.card}>
            {item.image && (
                <Image source={{ uri: item.image }} style={styles.eventImage} resizeMode="cover" />
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
    ), []);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={renderEvent}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
