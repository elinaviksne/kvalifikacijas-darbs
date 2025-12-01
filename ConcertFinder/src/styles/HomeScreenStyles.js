import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default StyleSheet.create({
  // Galvenais ekrāna konteineris
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingHorizontal: wp("5%"),
  },

  title: {
    fontSize: hp("3.2%"),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: hp("2.5%"),
  },

  list: {
    paddingTop: hp("5%"),
    paddingBottom: hp("5%"),
  },

  /* Kartītes (ConcertCard) stili */
  card: {
    backgroundColor: "#222",
    borderRadius: wp("5%"),
    padding: wp("5%"),
    marginBottom: hp("2.5%"),
  },

  eventImage: {
    width: "100%",
    height: hp("25%"),
    borderRadius: wp("3%"),
    marginBottom: hp("1.5%"),
    resizeMode: "cover",
  },

  eventName: {
    fontSize: hp("2.2%"),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: hp("0.8%"),
  },

  eventDate: {
    fontSize: hp("1.8%"),
    color: "#aaa",
  },

  eventVenue: {
    fontSize: hp("1.8%"),
    color: "#ccc",
    marginBottom: hp("2%"),
  },

  /* Biļešu pogas stili */
  ticketButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: hp("1.3%"),
    borderRadius: wp("3%"),
    alignItems: "center",
  },

  ticketButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp("2%"),
  },
});
