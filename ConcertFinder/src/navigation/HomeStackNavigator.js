import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
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
                <Stack.Screen
                    name="HomeMain"
                    component={HomeScreen}
                    options={{ title: "Concert Finder" }}
                />
            </Stack.Navigator>
        </SafeAreaView>
    );
}
