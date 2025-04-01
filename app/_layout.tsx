import { colors } from "@/constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import InitialLayout from "@/components/InitialLayout";

export default function RootLayout() {
    return (
        <ClerkProvider tokenCache={tokenCache}>
            <SafeAreaProvider>
                <SafeAreaView
                    style={{ flex: 1, backgroundColor: colors.background }}
                >
                    <InitialLayout />
                </SafeAreaView>
            </SafeAreaProvider>
        </ClerkProvider>
    );
}
