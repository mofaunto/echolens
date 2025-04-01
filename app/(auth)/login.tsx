import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useSSO } from "@clerk/clerk-expo";
import { styles } from "@/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";

export default function login() {
    const { startSSOFlow } = useSSO();
    const router = useRouter();
    const handleGoogleSignin = async () => {
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: "oauth_google",
            });

            if (setActive && createdSessionId) {
                setActive({ session: createdSessionId });
                router.replace("/(tabs)");
            }
        } catch (error) {
            console.error("OAuth error", error);
        }
    };
    return (
        <View style={styles.container}>
            {/* name section */}
            <View style={styles.heroSection}>
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons
                        name="waveform"
                        size={32}
                        color={colors.primary}
                    />
                </View>
                <Text style={styles.appName}>Echolens</Text>
                <Text style={styles.tagline}>feel the waves</Text>
            </View>

            {/* image */}
            <View style={styles.imageContainer}>
                <Image
                    source={require("../../assets/images/heroImage.png")}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            {/* Login */}
            <View style={styles.loginSection}>
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignin}
                    activeOpacity={0.9}
                >
                    <View style={styles.googleIconContainer}>
                        <Ionicons
                            name="logo-google"
                            size={20}
                            color={colors.surface}
                        />
                    </View>
                    <Text style={styles.googleButtonText}>
                        Continue with Google
                    </Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms and Privacy Policies
                </Text>
            </View>
        </View>
    );
}
