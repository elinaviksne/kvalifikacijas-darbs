import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { STACK_HEADER_TITLE_TEXT_STYLE } from "../constants/layout";
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
                headerTitleStyle: STACK_HEADER_TITLE_TEXT_STYLE,
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
