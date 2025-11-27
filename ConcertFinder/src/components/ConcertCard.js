import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import styles from "../styles/HomeScreenStyles";

const ConcertCard = ({ item }) => (
    // Kartīte, kas attēlo vienu koncerta ierakstu
    <View style={styles.card}>
        {item.image && <Image source={{ uri: item.image }} style={styles.eventImage} />}
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventVenue}>{item.venue}</Text>

        <TouchableOpacity style={styles.ticketButton} onPress={() => Linking.openURL(item.url)}>
            <Text style={styles.ticketButtonText}>Tickets</Text>
        </TouchableOpacity>
    </View>
);

export default memo(ConcertCard);