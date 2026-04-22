import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const REMINDER_CHANNEL_ID = "concert-reminders";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

function parseLocalDateString(dateString) {
    if (typeof dateString !== "string") return null;
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, 10, 0, 0, 0);
}

function buildReminderDate(dateString) {
    const eventDate = parseLocalDateString(dateString);
    if (!eventDate) return null;
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    return reminderDate;
}

async function ensureNotificationsReady() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
            name: "Concert reminders",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 150, 100, 150],
            lightColor: "#FF6F00",
        });
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
}

export async function scheduleConcertReminder({ name, date, venue }) {
    const reminderDate = buildReminderDate(date);
    if (!reminderDate || reminderDate <= new Date()) {
        return { scheduled: false, reminderAt: null, notificationId: null, reason: "date-unavailable" };
    }

    const granted = await ensureNotificationsReady();
    if (!granted) {
        return { scheduled: false, reminderAt: null, notificationId: null, reason: "permission-denied" };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Concert reminder",
            body: `${name || "Your concert"} is tomorrow${venue ? ` at ${venue}` : ""}.`,
            sound: true,
            data: { kind: "concert-reminder", concertName: name || "" },
            ...(Platform.OS === "android" ? { channelId: REMINDER_CHANNEL_ID } : {}),
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
        },
    });

    return {
        scheduled: true,
        reminderAt: reminderDate.toISOString(),
        notificationId,
        reason: null,
    };
}

export async function cancelConcertReminder(notificationId) {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
        
    }
}
