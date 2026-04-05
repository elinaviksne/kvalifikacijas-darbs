import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import ConcertCard, { getConcertSortDate } from "../components/ConcertCard";
import {
    fetchBilesuParadizeForGenre,
    fetchTicketmasterGenreConcerts,
    genreIdFromLabel,
} from "../services/ConcertService";
import styles from "../styles/HomeScreenStyles";

function mergeByDate(bilesu, ticketmaster) {
    return [...bilesu, ...ticketmaster].sort((a, b) =>
        getConcertSortDate(a).localeCompare(getConcertSortDate(b))
    );
}

/** Ticketmaster — Rīga kā rezerves meklējums, ja nav ģeolokācijas vai papildus apvienošanai ar radius. */
const TICKETMASTER_GENRE_CITY = "Riga";

export default function GenreResultsScreen({ route }) {
    const { genre, genreId: genreIdParam } = route.params;
    const genreId = genreIdParam ?? genreIdFromLabel(genre);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const tabBarHeight = useBottomTabBarHeight();

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        setLoadingMore(false);
        setEvents([]);

        let latestTicketmaster = [];
        let latestBilesu = [];
        let tmDone = false;
        let bpDone = false;

        const updateList = (bilesu, tmOverride) => {
            if (!isMounted) return;
            const tm = tmOverride ?? latestTicketmaster;
            setEvents(mergeByDate(bilesu, tm));
        };

        const maybeFinishLoading = () => {
            if (!isMounted) return;
            setLoadingMore(!(tmDone && bpDone));
            if (tmDone || bpDone) {
                setLoading(false);
            }
        };

        (async () => {
            let latlong = null;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const last = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
                    if (last?.coords) {
                        latlong = last.coords;
                    } else {
                        const loc = await Location.getCurrentPositionAsync({});
                        latlong = loc.coords;
                    }
                }
            } catch {
                /* ignore */
            }
            return fetchTicketmasterGenreConcerts(genreId, genre, {
                latlong,
                cityFallback: TICKETMASTER_GENRE_CITY,
            });
        })()
            .then((tm) => {
                if (!isMounted) return;
                latestTicketmaster = tm;
                tmDone = true;
                updateList(latestBilesu, tm);
                maybeFinishLoading();
            })
            .catch(() => {
                if (!isMounted) return;
                latestTicketmaster = [];
                tmDone = true;
                updateList(latestBilesu, []);
                maybeFinishLoading();
            });

        fetchBilesuParadizeForGenre(genreId, {
            onPartial: (partial) => {
                if (!isMounted) return;
                latestBilesu = partial;
                updateList(partial);
            },
        })
            .then((full) => {
                if (!isMounted) return;
                latestBilesu = full;
                bpDone = true;
                updateList(full);
                maybeFinishLoading();
            })
            .catch(() => {
                if (!isMounted) return;
                bpDone = true;
                maybeFinishLoading();
            });

        return () => { isMounted = false; };
    }, [genre, genreId]);

    if (loading && events.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ConcertCard item={item} />}
                contentContainerStyle={[styles.list, { paddingBottom: 32 + tabBarHeight }]}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListEmptyComponent={
                    !loadingMore ? (
                        <Text style={{ color: "white", textAlign: "center", marginTop: 24 }}>
                            No concerts found for this genre.
                        </Text>
                    ) : null
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View style={{ paddingVertical: 16, alignItems: "center" }}>
                            <ActivityIndicator size="small" color="#FF6F00" />
                            <Text style={{ color: "#aaa", marginTop: 8, fontSize: 12 }}>
                                Loading more…
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}
