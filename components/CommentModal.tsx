import {
    View,
    Text,
    Modal,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    FlatList,
    TextInput,
} from "react-native";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import Loader from "./Loader";
import Comment from "./Comment";

type CommentsModal = {
    postId: Id<"posts">;
    visible: boolean;
    onClose: () => void;
    onCommentAdded: () => void;
};

export default function CommentModal({
    postId,
    visible,
    onClose,
    onCommentAdded,
}: CommentsModal) {
    const [newComment, setNewComment] = useState("");

    const comments = useQuery(api.comments.getComments, { postId });
    const addComment = useMutation(api.comments.addComment);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await addComment({
                content: newComment,
                postId,
            });

            setNewComment("");
            onCommentAdded();
        } catch (error) {
            console.error("Failed to add a comment", error);
        }
    };

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            animationType="slide"
            transparent={true}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Comments</Text>
                    <View style={{ width: 24 }}></View>
                </View>

                {comments === undefined ? (
                    <Loader />
                ) : (
                    <FlatList
                        data={comments}
                        renderItem={({ item }) => <Comment comment={item} />}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.commentsList}
                    />
                )}

                <View style={styles.commentInput}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment"
                        placeholderTextColor={colors.grey}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />

                    <TouchableOpacity
                        onPress={handleAddComment}
                        disabled={!newComment.trim()}
                    >
                        <Text
                            style={[
                                styles.postButton,
                                !newComment.trim() && styles.postButtonDisabled,
                            ]}
                        >
                            Post
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
