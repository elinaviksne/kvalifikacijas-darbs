import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#222",
                    borderBottomColor: "transparent",
                },
                headerTintColor: "#FF6F00",
                headerTitleAlign: "center",
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={{ title: "Concert Finder" }}
            />
        </Stack.Navigator>
    );
}
