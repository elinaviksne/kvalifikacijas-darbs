import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStackNavigator from "./HomeStackNavigator";
import DiscoveryStackNavigator from "./DiscoveryStackNavigator";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: { backgroundColor: "#1E1E1E" },
                tabBarActiveTintColor: "#FF6F00",
                tabBarInactiveTintColor: "#888",
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === "HomeTab") iconName = "home";
                    else if (route.name === "DiscoveryTab") iconName = "search";
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ title: "Home" }}
            />
            <Tab.Screen
                name="DiscoveryTab"
                component={DiscoveryStackNavigator}
                options={{ title: "Discovery" }}
            />
        </Tab.Navigator>
    );
}
