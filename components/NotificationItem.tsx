import { colors } from "@/constants/theme";
import { styles } from "@/styles/notifications.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function NotificationItem({ notification }: any) {
    return (
        <View style={styles.notificationItem}>
            <View style={styles.notificationContent}>
                {/* gotta put correct url later */}
                <Link href={`/notifications`} asChild>
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image
                            source={notification.sender.image}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />

                        <View style={styles.iconBadge}>
                            {notification.type === "like" ? (
                                <Ionicons
                                    name="heart"
                                    size={16}
                                    color={colors.primary}
                                />
                            ) : notification.type === "follow" ? (
                                <Ionicons
                                    name="person-add"
                                    size={16}
                                    color="#8b5cf6"
                                />
                            ) : (
                                <Ionicons
                                    name="chatbubble"
                                    size={16}
                                    color="#3b82f6"
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                </Link>

                <View style={styles.notificationInfo}>
                    <Link href={`/notifications`} asChild>
                        <TouchableOpacity>
                            <Text style={styles.username}>
                                {notification.sender.username}
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    <Text style={styles.action}>
                        {notification.type === "follow"
                            ? "started following you"
                            : notification.type === "like"
                              ? "liked your post"
                              : `commented "${notification.comment}"`}
                    </Text>

                    <Text style={styles.timeAgo}>
                        {formatDistanceToNow(notification._creationTime, {
                            addSuffix: true,
                        })}
                    </Text>
                </View>
            </View>

            {notification.postId && (
                <Image
                    source={notification.post.imageUrl}
                    style={styles.postImage}
                    contentFit="cover"
                    transition={200}
                />
            )}
        </View>
    );
}
