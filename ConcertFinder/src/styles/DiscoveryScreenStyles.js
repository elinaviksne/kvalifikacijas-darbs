import { StyleSheet } from "react-native";

export default StyleSheet.create({
    // Galvenais konteineris ekrānam
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 16,
    },

    list: {
        paddingBottom: 40,
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
        marginHorizontal: 4,
    },

    genreText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
});
