import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#000",
        padding: 16,
    },

    list: {
        paddingBottom: 20,
    },

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

    genreText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
});
