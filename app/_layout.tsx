import { colors } from "@/constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "@/components/InitialLayout";
import ClerkConvexProvider from "@/providers/ClerkConvexProvider";
import { StatusBar } from "react-native";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useCallback } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    return (
        <ClerkConvexProvider>
            <SafeAreaProvider>
                <StatusBar translucent backgroundColor="transparent" />
                <SafeAreaView
                    style={{ flex: 1, backgroundColor: colors.background }}
                    onLayout={onLayoutRootView}
                >
                    <InitialLayout />
                </SafeAreaView>
            </SafeAreaProvider>
        </ClerkConvexProvider>
    );
}
