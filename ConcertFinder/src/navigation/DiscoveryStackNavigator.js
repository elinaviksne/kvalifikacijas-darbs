import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoveryScreen from "../screens/DiscoveryScreen";
import GenreResultsScreen from "../screens/GenreResultsScreen";

const Stack = createNativeStackNavigator();

export default function DiscoveryStackNavigator() {
    return (
        // Stack navigators Discovery sadaļai (meklēšana + žanru rezultāti)
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#222",
                    borderBottomColor: 'transparent'
                },
                headerTintColor: "#FF6F00",
                headerTitleAlign: "center",
                headerHideShadow: true
            }}
        >
            {/* Galvenais Discovery ekrāns ar meklēšanu un ieteikumiem */}
            <Stack.Screen
                name="DiscoveryMain"
                component={DiscoveryScreen}
                options={{ title: "Discover" }}
            />

            {/* Žanra rezultātu ekrāns */}
            <Stack.Screen
                name="GenreResults"
                component={GenreResultsScreen}
                options={({ route }) => ({
                    title: route.params.genre,
                })}
            />

        </Stack.Navigator>
    );
}
