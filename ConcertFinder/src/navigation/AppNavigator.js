import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeStackNavigator from "./HomeStackNavigator";
import DiscoveryStackNavigator from "./DiscoveryStackNavigator";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
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
            >
                <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
                <Tab.Screen name="DiscoveryTab" component={DiscoveryStackNavigator} />
            </Tab.Navigator>
        </SafeAreaView>
    );
}
