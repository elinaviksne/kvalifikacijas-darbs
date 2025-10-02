import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  imagePlaceholder: {
    backgroundColor: "#ff5722",
    borderRadius: 12,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
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
