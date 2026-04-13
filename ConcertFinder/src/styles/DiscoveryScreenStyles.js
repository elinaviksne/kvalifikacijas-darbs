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
    innerCanvas: {
        flex: 1,
        width: "100%",
        backgroundColor: "#121212",
    },
    discoverNavBar: {
        backgroundColor: HEADER_STATUS_BACKGROUND,
        paddingBottom: 14,
        marginHorizontal: -16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#333",
    },
    discoverNavTitle: {
        color: "#FF6F00",
        textAlign: "center",
        ...STACK_HEADER_TITLE_TEXT_STYLE,
    },
    stickySearchSection: {
        backgroundColor: "#121212",
        paddingTop: 12,
        paddingBottom: 2,
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    genreGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingTop: 4,
    },
    genreGridItem: {
        width: "48%",
        maxWidth: "48%",
        flex: 0,
        marginHorizontal: 0,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 14,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 14,
    },
    list: {
        paddingBottom: 24,
    },
    genreBox: {
        backgroundColor: "#2a2a2a",
        height: 112,
        flex: 1,
        borderRadius: 8,
        marginBottom: 12,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: "#333",
    },
    genreText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    searchMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    resultCount: {
        color: "#888",
        fontSize: 13,
    },
    genreSearchHero: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#333",
    },
    genreSearchThumb: {
        width: 72,
        height: 72,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    genreSearchTextCol: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
    },
    genreSearchTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: -0.3,
    },
    genreSearchKind: {
        fontSize: 13,
        fontWeight: "500",
        color: "#888",
        marginTop: 6,
    },
    genreSearchChevron: {
        marginLeft: 8,
    },
});
