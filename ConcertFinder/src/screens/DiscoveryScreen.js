import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ConcertCard from "../components/ConcertCard";
import {
    searchDiscoveryConcerts,
    findDiscoveryGenreRoute,
} from "../services/ConcertService";
import styles from "../styles/DiscoveryScreenStyles";

const GENRE_SEARCH_ACCENT = {
    rock: "#6B4E3D",
    pop: "#5C3D6B",
    hiphop: "#4A5C6B",
    jazz: "#6B5C3D",
    blues: "#3D4A6B",
    metal: "#4A4A4A",
    country: "#6B6B3D",
    folk: "#3D6B5C",
    edm: "#6B3D5C",
    classical: "#4A3D5C",
    opera: "#5C3D4A",
    schlager: "#5C5C3D",
    gospel: "#3D5C5C",
};

const GENRES = [
    { id: "rock", label: "Rock" },
    { id: "pop", label: "Pop" },
    { id: "hiphop", label: "Hip-Hop" },
    { id: "jazz", label: "Jazz" },
    { id: "blues", label: "Blues" },
    { id: "metal", label: "Metal" },
    { id: "country", label: "Country" },
    { id: "folk", label: "Folk" },
    { id: "edm", label: "EDM" },
    { id: "classical", label: "Classical" },
    { id: "opera", label: "Opera" },
    { id: "schlager", label: "Schlager" },
    { id: "gospel", label: "Gospel" },
];

const SEARCH_DEBOUNCE_MS = 450;

const ROW_DISCOVER = { rowType: "discover" };
const ROW_SEARCH = { rowType: "search" };
const ROW_BROWSE_ALL = { rowType: "browse_all" };

function chunkGenresIntoPairs(genres) {
    const rows = [];
    for (let i = 0; i < genres.length; i += 2) {
        const left = genres[i];
        const right = genres[i + 1] ?? null;
        rows.push({
            rowType: "genre_pair",
            id: `${left.id}_${right ? right.id : "solo"}`,
            left,
            right,
        });
    }
    return rows;
}

function genreHeroFromQuery(trimmed) {
    const route = findDiscoveryGenreRoute(trimmed);
    if (!route) return null;
    return {
        rowType: "genre",
        genre: route.genre,
        genreId: route.genreId,
    };
}

export default function DiscoveryScreen({ navigation }) {
    const tabBarHeight = useBottomTabBarHeight();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const trimmed = query.trim();
    const inSearchMode = trimmed.length >= 2;

    useEffect(() => {
        if (!inSearchMode) {
            setResults([]);
            setSearching(false);
            return undefined;
        }

        let cancelled = false;
        setSearching(true);
        const t = setTimeout(() => {
            searchDiscoveryConcerts(trimmed, "all")
                .then((data) => {
                    if (!cancelled) {
                        setResults(data);
                        setSearching(false);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setResults([]);
                        setSearching(false);
                    }
                });
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [trimmed, inSearchMode]);

    const searchRow = (
        <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Concerts, artists, genres…"
                placeholderTextColor="#666"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
                autoCorrect={false}
                autoCapitalize="none"
            />
            {query.length > 0 ? (
                <TouchableOpacity
                    onPress={() => {
                        setQuery("");
                        setResults([]);
                        Keyboard.dismiss();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                >
                    <Ionicons name="close-circle" size={22} color="#888" />
                </TouchableOpacity>
            ) : null}
        </View>
    );

    const resultsMeta =
        inSearchMode ? (
            <View style={styles.searchMeta}>
                <Text style={styles.sectionTitle}>Results</Text>
                {searching ? (
                    <ActivityIndicator size="small" color="#FF6F00" />
                ) : (
                    <Text style={styles.resultCount}>
                        {results.length} {results.length === 1 ? "concert" : "concerts"}
                    </Text>
                )}
            </View>
        ) : null;

    const stickySearchBlock = (
        <View style={styles.stickySearchSection}>
            {searchRow}
            {resultsMeta}
        </View>
    );

    const bottomPad = 32 + tabBarHeight;

    const scrollContentPad = {
        paddingBottom: bottomPad,
        paddingHorizontal: 16,
    };

    const genreHeroRow = useMemo(() => genreHeroFromQuery(trimmed), [trimmed]);

    const listData = useMemo(() => {
        if (!inSearchMode) {
            return [ROW_DISCOVER, ROW_SEARCH, ROW_BROWSE_ALL, ...chunkGenresIntoPairs(GENRES)];
        }
        const rows = [ROW_DISCOVER, ROW_SEARCH];
        if (genreHeroRow) rows.push(genreHeroRow);
        return [...rows, ...results];
    }, [inSearchMode, genreHeroRow, results]);

    const listKeyExtractor = useCallback((item) => {
        if (item.rowType === "discover") return "__discover";
        if (item.rowType === "search") return "__search";
        if (item.rowType === "browse_all") return "__browse_all";
        if (item.rowType === "genre_pair") return `pair_${item.id}`;
        if (item.rowType === "genre") return `__genre_${item.genreId}`;
        return String(item.id);
    }, []);

    const renderListRow = useCallback(
        ({ item }) => {
            if (item.rowType === "discover") {
                return (
                    <View style={[styles.discoverNavBar, { paddingTop: 10 }]}>
                        <Text style={styles.discoverNavTitle}>Discover</Text>
                    </View>
                );
            }
            if (item.rowType === "search") {
                return stickySearchBlock;
            }
            if (item.rowType === "browse_all") {
                return <Text style={styles.sectionTitle}>Browse all</Text>;
            }
            if (item.rowType === "genre_pair") {
                const cell = (g) => (
                    <TouchableOpacity
                        style={[styles.genreBox, styles.genreGridItem]}
                        onPress={() =>
                            navigation.navigate("GenreResults", {
                                genre: g.label,
                                genreId: g.id,
                            })
                        }
                    >
                        <Text style={styles.genreText}>{g.label}</Text>
                    </TouchableOpacity>
                );
                return (
                    <View style={styles.genrePairRow}>
                        {cell(item.left)}
                        {item.right ? (
                            cell(item.right)
                        ) : (
                            <View style={[styles.genreGridItem, { height: 112 }]} />
                        )}
                    </View>
                );
            }
            if (item.rowType === "genre") {
                const accent =
                    GENRE_SEARCH_ACCENT[item.genreId] ?? GENRE_SEARCH_ACCENT.rock;
                return (
                    <TouchableOpacity
                        style={styles.genreSearchHero}
                        onPress={() =>
                            navigation.navigate("GenreResults", {
                                genre: item.genre,
                                genreId: item.genreId,
                            })
                        }
                        activeOpacity={0.85}
                    >
                        <View
                            style={[styles.genreSearchThumb, { backgroundColor: accent }]}
                        >
                            <Ionicons name="musical-notes" size={36} color="#ffffffcc" />
                        </View>
                        <View style={styles.genreSearchTextCol}>
                            <Text style={styles.genreSearchTitle}>{item.genre}</Text>
                            <Text style={styles.genreSearchKind}>Genre</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={22}
                            color="#666"
                            style={styles.genreSearchChevron}
                        />
                    </TouchableOpacity>
                );
            }
            return <ConcertCard item={item} />;
        },
        [navigation, stickySearchBlock]
    );

    return (
        <View style={styles.statusBarFill}>
            <SafeAreaView style={styles.safeTransparent} edges={["top", "left", "right"]}>
                <View style={styles.innerCanvas}>
                    <FlatList
                        style={{ flex: 1 }}
                        data={listData}
                        numColumns={1}
                        keyExtractor={listKeyExtractor}
                        renderItem={renderListRow}
                        stickyHeaderIndices={[1]}
                        contentContainerStyle={[
                            styles.list,
                            scrollContentPad,
                            inSearchMode &&
                                results.length === 0 &&
                                !searching && { flexGrow: 1 },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator
                        ListFooterComponent={
                            inSearchMode && !searching && results.length === 0 ? (
                                <Text
                                    style={{
                                        color: "#888",
                                        textAlign: "center",
                                        marginTop: genreHeroRow ? 8 : 24,
                                        paddingHorizontal: 24,
                                    }}
                                >
                                    No concerts match that search. Try another keyword.
                                </Text>
                            ) : undefined
                        }
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

DiscoveryScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};
