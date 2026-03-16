import { StyleSheet } from "react-native";

export default StyleSheet.create({
    // Galvenais konteineris ekrānam
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#000",
        padding: 16,
    },

    // FlatList saraksta apakšējā atstarpe
    list: {
        paddingBottom: 20,
    },

    // Stils katram žanra pogas blokam
    genreBox: {
        backgroundColor: "#FF6F00",
        height: 120,
        flex: 1,
        borderRadius: 12,
        marginBottom: 16,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 6,
    },

    // Teksta stils žanra nosaukumam
    genreText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
});