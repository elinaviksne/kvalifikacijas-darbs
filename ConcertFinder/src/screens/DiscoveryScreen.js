import { Text, TouchableOpacity, FlatList, View } from "react-native";
import styles from "../styles/DiscoveryScreenStyles";

const GENRES = [
    { id: "rock", label: "Rock" },
    { id: "pop", label: "Pop" },
    { id: "hiphop", label: "Hip-Hop" },
    { id: "jazz", label: "Jazz" },
    { id: "blues", label: "Blues" },
    { id: "metal", label: "Metal" },
    { id: "country", label: "Country" },
    { id: "folk", label: "Folk" },
    { id: "edm", label: "EDM" },
    { id: "classical", label: "Classical" },
    { id: "opera", label: "Opera" },
    { id: "schlager", label: "Schlager" },
    { id: "gospel", label: "Gospel" },
];

export default function DiscoveryScreen({ navigation }) {
    const renderGenre = ({ item }) => (
        <TouchableOpacity
            style={styles.genreBox}
            onPress={() =>
                navigation.navigate("GenreResults", {
                    genre: item.label,
                    genreId: item.id,
                })
            }
        >
            <Text style={styles.genreText}>{item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={GENRES}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={renderGenre}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}
