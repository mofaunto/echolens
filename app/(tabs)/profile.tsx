import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TextInput,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function Profile() {
    const { signOut, userId } = useAuth();
    const router = useRouter();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const currentUser = useQuery(
        api.users.getUserByClerkId,
        userId ? { clerkId: userId } : "skip",
    );
    const updateProfile = useMutation(api.users.updateUser);

    const [editedProfile, setEditedProfile] = useState({
        name: currentUser?.name || "",
        bio: currentUser?.bio || "",
    });

    const posts = useQuery(api.users.getPostsByUser, {});

    const handleSaveProfile = async () => {
        await updateProfile(editedProfile);
        setIsEditModalVisible(false);
    };

    if (!currentUser || posts === undefined) return <Loader />;

    return (
        <View style={styles.container}>
            {/* header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{currentUser.username}</Text>
                <TouchableOpacity onPress={() => signOut()}>
                    <Ionicons
                        name="log-out-outline"
                        size={24}
                        color={colors.white}
                    />
                </TouchableOpacity>
            </View>

            {/* user profile and stats */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarAndStats}>
                        <Image
                            source={currentUser.image}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {currentUser.posts}
                                </Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {currentUser.followers}
                                </Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {currentUser.following}
                                </Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.name}>{currentUser.name}</Text>
                    {currentUser.bio && (
                        <Text style={styles.bio}>{currentUser.bio}</Text>
                    )}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setIsEditModalVisible(true)}
                        >
                            <Text style={styles.editButtonText}>
                                Edit Profile
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* posts by user */}

                {posts.length === 0 && <NoPostsFound />}

                <FlatList
                    data={posts}
                    numColumns={3}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.gridItem}
                            onPress={() => router.push(`/post/${item._id}`)}
                        >
                            <Image
                                source={item.imageUrl}
                                style={styles.gridImage}
                                contentFit="cover"
                                transition={200}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item._id}
                />
            </ScrollView>

            {/* Edit profile modal */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    Edit Profile
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setIsEditModalVisible(false)}
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={colors.white}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedProfile.name}
                                    returnKeyType="done"
                                    onChangeText={(text) =>
                                        setEditedProfile((prev) => ({
                                            ...prev,
                                            name: text,
                                        }))
                                    }
                                    placeholderTextColor={colors.grey}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Bio</Text>
                                <TextInput
                                    style={[styles.input, styles.bioInput]}
                                    value={editedProfile.bio}
                                    onChangeText={(text) =>
                                        setEditedProfile((prev) => ({
                                            ...prev,
                                            bio: text,
                                        }))
                                    }
                                    placeholderTextColor={colors.grey}
                                    placeholder="Tell about yourself"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.saveButtonText}>
                                    Save Changes
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const NoPostsFound = () => {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 40,
            }}
        >
            <Text style={{ fontSize: 20, color: colors.primary }}>
                No posts are found
            </Text>
        </View>
    );
};
