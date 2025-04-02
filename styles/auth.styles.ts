import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    heroSection: {
        alignItems: "center",
        marginTop: height * 0.12,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    appName: {
        fontSize: 40,
        fontWeight: 700,
        fontFamily: "Poppins-Bold",
        color: colors.primary,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: colors.grey,
        letterSpacing: 1,
        textTransform: "lowercase",
    },
    imageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    image: {
        width: width * 0.75,
        height: height * 0.75,
        maxHeight: 280,
    },
    loginSection: {
        width: "100%",
        paddingHorizontal: 24,
        paddingVertical: 40,
        alignItems: "center",
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 20,
        width: "100%",
        maxWidth: 320,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.surface,
    },
    termsText: {
        textAlign: "center",
        fontSize: 12,
        color: colors.grey,
        maxWidth: 280,
    },
});
