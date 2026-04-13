import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { STACK_HEADER_TITLE_TEXT_STYLE } from "../constants/layout";
import DiscoveryScreen from "../screens/DiscoveryScreen";
import GenreResultsScreen from "../screens/GenreResultsScreen";

const Stack = createNativeStackNavigator();

export default function DiscoveryStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#222",
                    borderBottomColor: "transparent",
                },
                headerTintColor: "#FF6F00",
                headerTitleAlign: "center",
                headerTitleStyle: STACK_HEADER_TITLE_TEXT_STYLE,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="DiscoveryMain"
                component={DiscoveryScreen}
                options={{ headerShown: false }}
            />

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
