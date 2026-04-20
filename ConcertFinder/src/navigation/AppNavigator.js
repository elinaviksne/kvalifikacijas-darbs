import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PropTypes from "prop-types";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeStackNavigator from "./HomeStackNavigator";
import DiscoveryStackNavigator from "./DiscoveryStackNavigator";
import AccountScreen from "../screens/AccountScreen";
import { TAB_BAR_BACKGROUND } from "../constants/layout";

const Tab = createBottomTabNavigator();

function MainTabBarIcon({ routeName, color, size }) {
    let iconName;
    if (routeName === "HomeTab") iconName = "home";
    else if (routeName === "DiscoveryTab") iconName = "search";
    else if (routeName === "AccountTab") iconName = "person";
    return <Ionicons name={iconName} size={size} color={color} />;
}

MainTabBarIcon.propTypes = {
    routeName: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
};

function MainTabBarIconHome(props) {
    return <MainTabBarIcon routeName="HomeTab" {...props} />;
}

function MainTabBarIconDiscovery(props) {
    return <MainTabBarIcon routeName="DiscoveryTab" {...props} />;
}

function MainTabBarIconAccount(props) {
    return <MainTabBarIcon routeName="AccountTab" {...props} />;
}

export default function AppNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
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
            }}
            lazy={false}
            sceneContainerStyle={{ backgroundColor: "#111" }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{
                    title: "Home",
                    unmountOnBlur: false,
                    tabBarIcon: MainTabBarIconHome,
                }}
            />
            <Tab.Screen
                name="DiscoveryTab"
                component={DiscoveryStackNavigator}
                options={{
                    title: "Discover",
                    unmountOnBlur: false,
                    tabBarIcon: MainTabBarIconDiscovery,
                }}
            />
            <Tab.Screen
                name="AccountTab"
                component={AccountScreen}
                options={{
                    title: "Account",
                    unmountOnBlur: false,
                    tabBarIcon: MainTabBarIconAccount,
                }}
            />
        </Tab.Navigator>
    );
}
