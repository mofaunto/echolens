import { colors } from "@/constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "@/components/InitialLayout";
import ClerkConvexProvider from "@/providers/ClerkConvexProvider";
import { StatusBar } from "react-native";

export default function RootLayout() {
    return (
        <ClerkConvexProvider>
            <SafeAreaProvider>
                <StatusBar translucent backgroundColor="transparent" />
                <SafeAreaView
                    style={{ flex: 1, backgroundColor: colors.background }}
                >
                    <InitialLayout />
                </SafeAreaView>
            </SafeAreaProvider>
        </ClerkConvexProvider>
    );
}
