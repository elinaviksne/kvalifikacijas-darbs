import { Platform } from "react-native";

/** Saskaņots ar tab joslu (`AppNavigator`) un Android sistēmas navigācijas joslu. */
export const TAB_BAR_BACKGROUND = "#222222";

/** Stack / Discover virsraksta josla un status joslas krāsa (viena tonī). */
export const HEADER_STATUS_BACKGROUND = "#222";

export const STACK_HEADER_TITLE_TEXT_STYLE = Platform.select({
    ios: {
        fontFamily: "System",
        fontWeight: "600",
        fontSize: 17,
    },
    android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal",
        fontSize: 20,
    },
    default: {
        fontSize: 18,
        fontWeight: "600",
    },
});
