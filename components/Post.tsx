import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

export default function Post({ post }: { post: any }) {
    return (
        <View style={styles.post}>
            {/* top section of the post */}
            <View style={styles.postHeader}>
                <Link href={"/notifications"}>
                    <TouchableOpacity style={styles.postHeaderLeft}>
                        <Image
                            source={post.author.image}
                            style={styles.postAvatar}
                            contentFit="cover"
                            transition={200}
                            cachePolicy={"memory-disk"}
                        />
                        <Text style={styles.postUsername}>
                            {post.author.username}
                        </Text>
                    </TouchableOpacity>
                </Link>

                <TouchableOpacity>
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color={colors.white}
                    />
                </TouchableOpacity>
            </View>

            {/* post content */}

            <Image
                source={post.imageUrl}
                style={styles.postImage}
                contentFit="cover"
                transition={200}
                cachePolicy={"memory-disk"}
            />

            {/* actions */}
            <View style={styles.postActions}>
                <View style={styles.postActionsLeft}>
                    <TouchableOpacity>
                        <Ionicons
                            name="heart-outline"
                            size={24}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons
                            name="chatbubble-outline"
                            size={24}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <Ionicons
                        name="bookmark-outline"
                        size={24}
                        color={colors.white}
                    />
                </TouchableOpacity>
            </View>

            {/* post caption */}
            <View style={styles.postInfo}>
                <Text style={styles.likesText}>Be the first to like</Text>
                {post.caption && (
                    <View style={styles.captionContainer}>
                        <Text style={styles.captionUsername}>
                            {post.author.username}
                        </Text>
                        <Text style={styles.captionText}>{post.caption}</Text>
                    </View>
                )}

                <TouchableOpacity>
                    <Text style={styles.commentText}>View all comments</Text>
                </TouchableOpacity>
                <Text style={styles.timeAgo}>2 hours ago</Text>
            </View>
        </View>
    );
}
