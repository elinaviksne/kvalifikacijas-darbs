import { StyleSheet } from "react-native";

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    card: {
        backgroundColor: "#222",
        borderRadius: 16,
        padding: 16,
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 6,
    },
    subtitle: {
        color: "#bbb",
        fontSize: 14,
        marginBottom: 18,
    },
    form: {
        gap: 10,
    },
    input: {
        backgroundColor: "#181818",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 10,
        color: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    actionButton: {
        backgroundColor: "#FF6F00",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 4,
    },
    secondaryButton: {
        backgroundColor: "#3a3a3a",
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
    loggedInSection: {
        gap: 10,
    },
    loggedInLabel: {
        color: "#bbb",
        fontSize: 13,
    },
    userEmail: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    errorText: {
        color: "#ff8e8e",
        marginTop: 12,
    },
});
