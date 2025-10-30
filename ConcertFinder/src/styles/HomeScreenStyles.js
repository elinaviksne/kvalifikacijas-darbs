import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  list: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },

  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: "#aaa",
  },
  eventVenue: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 15,
  },
  ticketButton: {
    backgroundColor: "#00c4b4",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  ticketButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
