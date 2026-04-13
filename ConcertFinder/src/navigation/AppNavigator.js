import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeStackNavigator from "./HomeStackNavigator";
import DiscoveryStackNavigator from "./DiscoveryStackNavigator";
import { TAB_BAR_BACKGROUND } from "../constants/layout";

const Tab = createBottomTabNavigator();

function MainTabBarIcon({ routeName, color, size }) {
    let iconName;
    if (routeName === "HomeTab") iconName = "home";
    else if (routeName === "DiscoveryTab") iconName = "search";
    return <Ionicons name={iconName} size={size} color={color} />;
}

export default function AppNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: TAB_BAR_BACKGROUND,
                    borderTopWidth: 0,
                    paddingTop: 8,
                    paddingBottom: Math.max(insets.bottom, 10),
                    minHeight: 52 + insets.bottom,
                },
                tabBarActiveTintColor: "#FF6F00",
                tabBarInactiveTintColor: "#888",
                tabBarIcon: ({ color, size }) => (
                    <MainTabBarIcon routeName={route.name} color={color} size={size} />
                ),
            })}
            lazy={false}
            sceneContainerStyle={{ backgroundColor: "#111" }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{
                    title: "Home",
                    unmountOnBlur: false,
                }}
            />
            <Tab.Screen
                name="DiscoveryTab"
                component={DiscoveryStackNavigator}
                options={{
                    title: "Discover",
                    unmountOnBlur: false,
                }}
            />
        </Tab.Navigator>
    );
}
