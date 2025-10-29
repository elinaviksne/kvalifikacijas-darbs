import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoveryScreen from "../screens/DiscoveryScreen";

const Stack = createNativeStackNavigator();

export default function DiscoveryStackNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="DiscoveryMain"
                component={DiscoveryScreen}
                options={{ title: "Discover" }}
            />
        </Stack.Navigator>
    );
}
