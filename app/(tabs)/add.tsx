import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    TextInput,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { styles } from "@/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AddScreen() {
    const router = useRouter();
    const { user } = useUser();

    const [caption, setCaption] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) setSelectedImage(result.assets[0].uri);
    };

    const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
    const createPost = useMutation(api.posts.createPost);

    const handleShare = async () => {
        if (!selectedImage) return;

        try {
            setIsSharing(true);
            const uploadUrl = await generateUploadUrl();

            const uploadResult = await FileSystem.uploadAsync(
                uploadUrl,
                selectedImage,
                {
                    httpMethod: "POST",
                    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
                    mimeType: "image/jpeg",
                },
            );

            if (uploadResult.status !== 200) throw new Error("Upload failure");

            const { storageId } = JSON.parse(uploadResult.body);
            await createPost({ storageId, caption });

            // if upload success, redirect to homepage
            router.push("/(tabs)");
        } catch (error) {
            console.log("Error with sharing");
        } finally {
            setIsSharing(false);
        }
    };

    if (!selectedImage) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons
                            name="arrow-back"
                            size={28}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Post</Text>
                    <View style={{ width: 28 }} />
                </View>

                <TouchableOpacity
                    style={styles.emptyImageContainer}
                    onPress={pickImage}
                >
                    <Ionicons
                        name="image-outline"
                        size={48}
                        color={colors.grey}
                    />
                    <Text style={styles.emptyImageText}>
                        Tap to select an image
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 48}
        >
            {/* page header */}
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedImage(null);
                            setCaption("");
                        }}
                        disabled={isSharing}
                    >
                        <Ionicons
                            name="close-outline"
                            size={28}
                            color={isSharing ? colors.grey : colors.white}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Post</Text>
                    <TouchableOpacity
                        style={[
                            styles.shareButton,
                            isSharing && styles.shareButtonDisabled,
                        ]}
                        disabled={isSharing || !selectedImage}
                        onPress={handleShare}
                    >
                        {isSharing ? (
                            <ActivityIndicator
                                size="small"
                                color={colors.primary}
                            />
                        ) : (
                            <Text style={styles.shareText}>Upload</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={[
                        styles.content,
                        isSharing && styles.contentDisabled,
                    ]}
                >
                    <View style={styles.imageSection}>
                        <Image
                            source={selectedImage}
                            style={styles.previewImage}
                            contentFit="cover"
                            transition={200}
                        />

                        <TouchableOpacity
                            style={styles.changeImageButton}
                            onPress={pickImage}
                            disabled={isSharing}
                        >
                            <Ionicons
                                name="image-outline"
                                size={20}
                                color={colors.white}
                            />
                            <Text style={styles.changeImageText}>
                                Change Image
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputSection}>
                        <View style={styles.captionContainer}>
                            <Image
                                source={user?.imageUrl}
                                style={styles.userAvatar}
                                contentFit="cover"
                                transition={200}
                            />

                            <TextInput
                                style={styles.captionInput}
                                placeholder="Image description"
                                placeholderTextColor={colors.grey}
                                multiline
                                value={caption}
                                onChangeText={setCaption}
                                editable={!isSharing}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
