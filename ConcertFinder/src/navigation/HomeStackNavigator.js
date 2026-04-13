import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
    HEADER_STATUS_BACKGROUND,
    STACK_HEADER_TITLE_TEXT_STYLE,
} from "../constants/layout";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: HEADER_STATUS_BACKGROUND,
                    borderBottomColor: "transparent",
                },
                headerTintColor: "#FF6F00",
                headerTitleAlign: "center",
                headerTitleStyle: STACK_HEADER_TITLE_TEXT_STYLE,
                headerShadowVisible: false,
                statusBarStyle: "light",
                statusBarBackgroundColor: HEADER_STATUS_BACKGROUND,
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
