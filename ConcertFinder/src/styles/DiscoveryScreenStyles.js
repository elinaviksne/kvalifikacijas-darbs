import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#111",
        paddingHorizontal: 20,
    },

    list: {
        paddingTop: 40,
        paddingBottom: 40,
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
