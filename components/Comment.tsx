import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";

interface Comment {
    content: string;
    _creationTime: number;
    userId: string;
    user: {
        name?: string;
        image?: string;
    };
}

export default function Comment({ comment }: { comment: Comment }) {
    const router = useRouter();

    return (
        <View style={styles.commentContainer}>
            <TouchableOpacity
                onPress={() => router.push(`/user/${comment.userId}`)}
            >
                <Image
                    source={{ uri: comment.user.image }}
                    style={styles.commentAvatar}
                />
            </TouchableOpacity>
            <View style={styles.commentContent}>
                <Text style={styles.commentUsername}>{comment.user.name}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>
                    {formatDistanceToNow(comment._creationTime, {
                        addSuffix: true,
                    })}
                </Text>
            </View>
        </View>
    );
}
