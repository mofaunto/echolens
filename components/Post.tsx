import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/feed.styles";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CommentModal from "./CommentModal";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-expo";

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

    // for patching and showing options of the post
    const [showOptions, setShowOptions] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateCaption, setUpdateCaption] = useState(post.caption || "");
    const [localCaption, setLocalCaption] = useState(post.caption || "");

    const { user } = useUser(); //User in clerk
    const currentUser = useQuery(
        api.users.getUserByClerkId,
        user ? { clerkId: user.id } : "skip",
    ); //user in db

    const toggleLike = useMutation(api.posts.toggleLike);
    const toggleSave = useMutation(api.saves.toggleSave);
    const deletePost = useMutation(api.posts.deletePost);
    const updatePost = useMutation(api.posts.patchPost);

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

    const handleDelete = () => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePost({ postId: post._id });
                            Alert.alert("Post deleted successfully");
                        } catch (error) {
                            Alert.alert("Error deleting post");
                        }
                    },
                },
            ],
            { cancelable: true },
        );
    };

    const handleUpdate = async () => {
        try {
            const updatedPost = await updatePost({
                postId: post._id,
                caption: updateCaption,
            });
            if (!updatedPost) {
                throw new Error("Post update failed");
            }
            // Use a default value if caption is undefined.
            setLocalCaption(updatedPost.caption || "");
            setShowUpdateModal(false);
            Alert.alert("Post updated successfully");
        } catch (error) {
            Alert.alert("Error updating post");
        }
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

                <TouchableOpacity
                    onPress={() => {
                        // Only show options if the post belongs to the current user
                        if (
                            currentUser &&
                            currentUser._id === post.author._id
                        ) {
                            setShowOptions(true);
                        }
                    }}
                >
                    {currentUser && currentUser._id === post.author._id && (
                        <Ionicons
                            name="ellipsis-horizontal"
                            size={20}
                            color={colors.white}
                        />
                    )}
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

            {/* update and delete options */}
            <Modal
                transparent
                animationType="slide"
                visible={showOptions}
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                    activeOpacity={1}
                    onPressOut={() => setShowOptions(false)}
                >
                    <View
                        style={{
                            backgroundColor: colors.background,
                            padding: 20,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setShowOptions(false);
                                setShowUpdateModal(true);
                                setUpdateCaption(localCaption);
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    marginBottom: 32,
                                    color: colors.white,
                                }}
                            >
                                Update Post
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowOptions(false);
                                handleDelete();
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    marginBottom: 32,
                                    color: "red",
                                }}
                            >
                                Delete Post
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowOptions(false)}>
                            <Text
                                style={{
                                    fontSize: 18,
                                    textAlign: "center",
                                    color: colors.grey,
                                }}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Update Post Modal */}
            <Modal
                transparent
                animationType="slide"
                visible={showUpdateModal}
                onRequestClose={() => setShowUpdateModal(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                    activeOpacity={1}
                    onPressOut={() => setShowUpdateModal(false)}
                >
                    <View
                        style={{
                            backgroundColor: colors.background,
                            padding: 20,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                marginBottom: 16,
                                color: colors.white,
                            }}
                        >
                            Update Caption
                        </Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                padding: 16,
                                borderRadius: 4,
                                marginBottom: 32,
                                color: colors.white,
                            }}
                            value={updateCaption}
                            onChangeText={setUpdateCaption}
                            placeholder="Enter new caption"
                            placeholderTextColor={colors.grey}
                        />
                        <TouchableOpacity onPress={handleUpdate}>
                            <Text
                                style={{
                                    fontSize: 18,
                                    marginBottom: 32,
                                    color: colors.primary,
                                }}
                            >
                                Save
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowUpdateModal(false)}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    textAlign: "center",
                                    color: colors.grey,
                                }}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
