import { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    Text,
    RefreshControl,
} from "react-native";
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

const REFRESH_COLORS = ["#FF6F00"];

export default function GenreResultsScreen({ route }) {
    const { genre, genreId: genreIdParam } = route.params;
    const genreId = genreIdParam ?? genreIdFromLabel(genre);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const tabBarHeight = useBottomTabBarHeight();
    const mounted = useRef(true);
    const loadIdRef = useRef(0);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const loadGenreData = useCallback(
        (isRefresh) => {
            const loadId = ++loadIdRef.current;

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
                setLoadingMore(false);
                setEvents([]);
            }

            let latestTicketmaster = [];
            let latestBilesu = [];
            let tmDone = false;
            let bpDone = false;

            const isStale = () => !mounted.current || loadId !== loadIdRef.current;

            const updateList = (bilesu, tmOverride) => {
                if (isStale()) return;
                const tm = tmOverride ?? latestTicketmaster;
                setEvents(mergeByDate(bilesu, tm));
            };

            const maybeFinishLoading = () => {
                if (isStale()) return;
                const bothDone = tmDone && bpDone;
                setLoadingMore(!bothDone);
                if (tmDone || bpDone) {
                    setLoading(false);
                }
                if (bothDone) {
                    setRefreshing(false);
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
                    if (isStale()) return;
                    latestTicketmaster = tm;
                    tmDone = true;
                    updateList(latestBilesu, tm);
                    maybeFinishLoading();
                })
                .catch(() => {
                    if (isStale()) return;
                    latestTicketmaster = [];
                    tmDone = true;
                    updateList(latestBilesu, []);
                    maybeFinishLoading();
                });

            fetchBilesuParadizeForGenre(genreId, {
                onPartial: (partial) => {
                    if (isStale()) return;
                    latestBilesu = partial;
                    updateList(partial);
                },
            })
                .then((full) => {
                    if (isStale()) return;
                    latestBilesu = full;
                    bpDone = true;
                    updateList(full);
                    maybeFinishLoading();
                })
                .catch(() => {
                    if (isStale()) return;
                    bpDone = true;
                    maybeFinishLoading();
                });
        },
        [genre, genreId]
    );

    useEffect(() => {
        loadGenreData(false);
    }, [loadGenreData]);

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
                contentContainerStyle={[
                    styles.list,
                    { paddingBottom: 32 + tabBarHeight },
                    events.length === 0 && { flexGrow: 1 },
                ]}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadGenreData(true)}
                        tintColor="#FF6F00"
                        colors={REFRESH_COLORS}
                    />
                }
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
