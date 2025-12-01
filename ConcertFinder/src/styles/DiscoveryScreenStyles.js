import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default StyleSheet.create({
    // Galvenais konteineris ekrānam
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: wp("4%"),
    },

    list: {
        paddingBottom: hp("5%"),
    },

    // Stils katram žanra pogas blokam
    genreBox: {
        backgroundColor: "#FF6F00",
        height: hp("15%"),
        flex: 1,
        borderRadius: wp("3%"),
        marginBottom: hp("2%"),
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: wp("1%"),
    },

    genreText: {
        fontSize: hp("2.6%"),
        fontWeight: "bold",
        color: "#fff",
    },
});
