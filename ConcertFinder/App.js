import { useEffect } from "react";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppState, InteractionManager, Platform, View } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { TAB_BAR_BACKGROUND } from "./src/constants/layout";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: TAB_BAR_BACKGROUND,
  },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const applyNavBarStyle = () => {
      void NavigationBar.setButtonStyleAsync("light");
    };

    applyNavBarStyle();
    const raf = requestAnimationFrame(applyNavBarStyle);
    const interaction = InteractionManager.runAfterInteractions(applyNavBarStyle);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") applyNavBarStyle();
    });

    return () => {
      cancelAnimationFrame(raf);
      interaction.cancel();
      sub.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: TAB_BAR_BACKGROUND }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor={TAB_BAR_BACKGROUND} translucent />
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}
