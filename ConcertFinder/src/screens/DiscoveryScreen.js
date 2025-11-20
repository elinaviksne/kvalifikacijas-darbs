import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/DiscoveryScreenStyles";

const GENRES = [
    { id: "rock", label: "Rock" },
    { id: "pop", label: "Pop" },
    { id: "hiphop", label: "Hip-Hop" },
    { id: "jazz", label: "Jazz" },
    { id: "metal", label: "Metal" },
    { id: "country", label: "Country" },
    { id: "edm", label: "EDM" },
    { id: "classical", label: "Classical" },
];

export default function DiscoveryScreen({ navigation }) {
    const renderGenre = ({ item }) => (
        <TouchableOpacity
            style={styles.genreBox}
            onPress={() =>
                navigation.navigate("GenreResults", {
                    genre: item.label,
                })
            }
        >
            <Text style={styles.genreText}>{item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={GENRES}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={renderGenre}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}
