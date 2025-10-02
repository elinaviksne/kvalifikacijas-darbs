import styles from "./styles";

import { StatusBar } from "expo-status-bar";
import { Linking, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";

const API_KEY = "5lXcgONUwiIfm9ZIRYuA2t04jhvRErrk";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

export default function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(
          `${BASE_URL}?apikey=${API_KEY}&keyword=rock&city=New York`
        );
        const data = await response.json();

        if (data._embedded && data._embedded.events) {
          const cleanEvents = data._embedded.events.map((event) => ({
            id: event.id,
            name: event.name,
            date: event.dates.start.localDate,
            venue: event._embedded.venues[0].name,
            url: event.url,
          }));
          setEvents(cleanEvents);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    }

    fetchEvents();
  }, []);

  const renderEvent = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
      </View>
      <Text style={styles.eventName}>{item.name}</Text>
      <Text style={styles.eventDate}>{item.date}</Text>
      <Text style={styles.eventVenue}>{item.venue}</Text>
      <TouchableOpacity 
        style={styles.ticketButton}
        onPress={() => Linking.openURL(item.url)}>
        <Text style={styles.ticketButtonText}>Tickets</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Concerts</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
      />
      <StatusBar style="light" />
    </View>
  );
}
