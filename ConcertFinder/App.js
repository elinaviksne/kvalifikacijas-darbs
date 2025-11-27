import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

export default function App() {
  return (
    // Nodrošina pareizu satura attēlošanu ierīcēs ar robiem, 
    // statusu joslu un apakšējo joslu
    <SafeAreaProvider>
      {/* Globālie statusa joslas (StatusBar) stili visai aplikācijai */}
      <StatusBar
        hidden={false}
        backgroundColor="#222"
        barStyle="light-content"
        translucent={false} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider >
  );
}
