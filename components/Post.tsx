import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/feed.styles";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import CommentModal from "./CommentModal";
import { formatDistanceToNow } from "date-fns";

type PostProps = {
    post: {
        _id: Id<"posts">;
        imageUrl: string;
        caption?: string;
        likes: number;
        comments: number;
        _creationTime: number;
        isLiked: boolean;
        isSaved: boolean;
        author: {
            _id: string;
            username: string;
            image: string;
        };
    };
};

export default function Post({ post }: PostProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likes, setLikes] = useState(post.likes);
    const [comments, setComments] = useState(post.comments);
    const [showComments, setShowComments] = useState(false);
    const [isSaved, setIsSaved] = useState(post.isSaved);

    const toggleLike = useMutation(api.posts.toggleLike);
    const toggleSave = useMutation(api.saves.toggleSave);

    const handleLike = async () => {
        try {
            const newLikeState = await toggleLike({ postId: post._id });
            setIsLiked(newLikeState);
            setLikes((prev) => (newLikeState ? prev + 1 : prev - 1));
        } catch (error) {
            console.error("Error toggling like", error);
        }
    };

    const handleSave = async () => {
        const newSavedState = await toggleSave({ postId: post._id });
        setIsSaved(newSavedState);
    };

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
                    <TouchableOpacity onPress={handleLike}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? colors.primary : colors.white}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowComments(true)}>
                        <Ionicons
                            name="chatbubble-outline"
                            size={24}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleSave}>
                    <Ionicons
                        name={isSaved ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={isSaved ? colors.primary : colors.white}
                    />
                </TouchableOpacity>
            </View>

            {/* post caption */}
            <View style={styles.postInfo}>
                <Text style={styles.likesText}>
                    {likes > 0
                        ? `${likes.toLocaleString()} likes`
                        : "Be the first to like"}
                </Text>
                {post.caption && (
                    <View style={styles.captionContainer}>
                        <Text style={styles.captionUsername}>
                            {post.author.username}
                        </Text>
                        <Text style={styles.captionText}>{post.caption}</Text>
                    </View>
                )}

                {comments > 0 && (
                    <TouchableOpacity onPress={() => setShowComments(true)}>
                        <Text style={styles.commentsText}>
                            View all {comments} comments
                        </Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.timeAgo}>
                    {formatDistanceToNow(post._creationTime, {
                        addSuffix: true,
                    })}
                </Text>
            </View>

            <CommentModal
                postId={post._id}
                visible={showComments}
                onClose={() => setShowComments(false)}
                onCommentAdded={() => setComments((prev) => prev + 1)}
            />
        </View>
    );
}
