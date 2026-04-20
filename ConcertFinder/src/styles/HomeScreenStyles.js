import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#111",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
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
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: "cover",
  },

  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },

  eventDate: {
    fontSize: 14,
    color: "#aaa",
  },

  eventVenue: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 16,
  },

  ticketButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  saveButton: {
    width: 46,
    height: 46,
    minWidth: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2d2d2d",
    zIndex: 2,
    elevation: 2,
  },
  saveButtonActive: {
    backgroundColor: "#FF6F00",
    borderColor: "#FF6F00",
  },
  saveFeedbackText: {
    color: "#bdbdbd",
    fontSize: 12,
    marginTop: 8,
  },

  ticketButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
