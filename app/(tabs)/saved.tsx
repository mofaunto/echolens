import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { colors } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function Saved() {
    const savedPosts = useQuery(api.saves.getSaves);
    const router = useRouter();

    if (savedPosts === undefined) return <Loader />;
    if (savedPosts.length === 0) return <NoSavesFound />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saved posts</Text>
            </View>

            <ScrollView
                contentContainerStyle={{
                    padding: 8,
                    flexDirection: "row",
                    flexWrap: "wrap",
                }}
            >
                {savedPosts.map((post) => {
                    if (!post) return null;

                    return (
                        <View
                            key={post._id}
                            style={{ width: "33.33%", padding: 1 }}
                        >
                            <TouchableOpacity
                                onPress={() => router.push(`/post/${post._id}`)}
                            >
                                <Image
                                    source={post.imageUrl}
                                    style={{ width: "100%", aspectRatio: 1 }}
                                    contentFit="cover"
                                    transition={200}
                                    cachePolicy="memory-disk"
                                />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const NoSavesFound = () => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.background,
            }}
        >
            <Text style={{ color: colors.primary, fontSize: 20 }}>
                No saved posts
            </Text>
        </View>
    );
};
