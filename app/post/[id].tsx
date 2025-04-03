import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import Post from "@/components/Post";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

export default function SinglePostScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const post = useQuery(api.posts.getPostById, { postId: id as Id<"posts"> });

    const handleBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)");
    };

    if (!post) {
        return <Loader />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={colors.white}
                    />
                </TouchableOpacity>
                <View style={{ width: 24 }} />
            </View>
            <Post post={post} />
        </View>
    );
}
