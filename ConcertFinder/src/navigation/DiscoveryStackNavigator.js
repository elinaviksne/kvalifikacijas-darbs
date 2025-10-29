import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoveryScreen from "../screens/DiscoveryScreen";

const Stack = createNativeStackNavigator();

export default function DiscoveryStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#1E1E1E",
                },
                headerTintColor: "#FF6F00",
                headerTitleAlign: "center",
                statusBarStyle: "light",
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="DiscoveryMain"
                component={DiscoveryScreen}
                options={{ title: "Discover" }}
            />
        </Stack.Navigator>
    );
}
