import { StyleSheet } from "react-native";
import { HEADER_STATUS_BACKGROUND, STACK_HEADER_TITLE_TEXT_STYLE } from "../constants/layout";

export default StyleSheet.create({
    statusBarFill: {
        flex: 1,
        width: "100%",
        backgroundColor: HEADER_STATUS_BACKGROUND,
    },
    safeTransparent: {
        flex: 1,
        backgroundColor: "transparent",
    },
    accountNavBar: {
        backgroundColor: HEADER_STATUS_BACKGROUND,
        paddingTop: 10,
        paddingBottom: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#333",
    },
    accountNavTitle: {
        color: "#FF6F00",
        textAlign: "center",
        ...STACK_HEADER_TITLE_TEXT_STYLE,
    },
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    scrollContent: {
        flexGrow: 1,
    },
    card: {
        backgroundColor: "#222",
        borderRadius: 16,
        padding: 16,
    },
    subtitle: {
        color: "#bbb",
        fontSize: 14,
        marginBottom: 14,
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
        gap: 16,
    },
    profileHeader: {
        alignItems: "center",
        paddingTop: 8,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#3a3a3a",
        borderWidth: 3,
        borderColor: "#FF6F00",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 34,
    },
    displayName: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 24,
        marginTop: 12,
    },
    username: {
        color: "#aaa",
        fontSize: 16,
        marginTop: 2,
    },
    editButton: {
        marginTop: 12,
        backgroundColor: "#f1f1f1",
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 8,
    },
    editButtonText: {
        color: "#111",
        fontWeight: "700",
    },
    savedConcertsSection: {
        marginTop: 8,
    },
    savedTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    savedConcertsPlaceholder: {
        backgroundColor: "#181818",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 12,
        minHeight: 220,
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
    },
    savedPlaceholderText: {
        color: "#888",
        textAlign: "center",
        fontSize: 14,
    },
    savedConcertsList: {
        gap: 10,
    },
    savedConcertItem: {
        backgroundColor: "#181818",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 12,
        padding: 12,
    },
    savedConcertRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    savedConcertTextCol: {
        flex: 1,
    },
    savedConcertName: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 4,
    },
    savedConcertMeta: {
        color: "#aaa",
        fontSize: 13,
    },
    removeSavedButton: {
        backgroundColor: "#3a3a3a",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    removeSavedButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    errorText: {
        color: "#ff8e8e",
        marginTop: 12,
    },
});
