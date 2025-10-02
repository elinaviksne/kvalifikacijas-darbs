import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useEffect, useState } from 'react';

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
          const cleanEvents = data._embedded.events.map(event => ({
            id: event.id,
            name: event.name,
            date: event.dates.start.localDate,
            venue: event._embedded.venues[0].name,
          }));
          setEvents(cleanEvents);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    }

    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 ConcertFinder</Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text style={styles.event}>
            {item.name} - {item.date} @ {item.venue}
          </Text>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  event: {
    fontSize: 16,
    marginBottom: 10,
  },
});