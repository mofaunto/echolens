import { View, ActivityIndicator } from "react-native";
import React from "react";
import { colors } from "@/constants/theme";

export default function Loader() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.background,
            }}
        >
            <ActivityIndicator size={"large"} color={colors.primary} />
        </View>
    );
}
