import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeStackNavigator from "./HomeStackNavigator";
import DiscoveryStackNavigator from "./DiscoveryStackNavigator";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#222",
                    borderTopWidth: 0,
                    height: 60,
                    paddingBottom: 0,
                },
                tabBarActiveTintColor: "#FF6F00",
                tabBarInactiveTintColor: "#888",
                tabBarSafeAreaInsets: { bottom: 0 },
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === "HomeTab") iconName = "home";
                    else if (route.name === "DiscoveryTab") iconName = "search";
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
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
