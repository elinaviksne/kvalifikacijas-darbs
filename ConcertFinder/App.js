import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, StatusBar } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { TAB_BAR_BACKGROUND } from "./src/constants/layout";

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setBackgroundColorAsync(TAB_BAR_BACKGROUND);
    NavigationBar.setButtonStyleAsync("light");
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        hidden={false}
        backgroundColor={TAB_BAR_BACKGROUND}
        barStyle="light-content"
        translucent={false}
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
