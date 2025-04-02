import Loader from "@/components/Loader";
import NotificationItem from "@/components/NotificationItem";
import { colors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/notifications.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import React from "react";
import { FlatList, Text, View } from "react-native";

export default function Notifications() {
    const notifications = useQuery(api.notifications.getNotifications);

    if (notifications === undefined) return <Loader />;
    if (notifications.length === 0) return <NoNotifications />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={({ item }) => (
                    <NotificationItem notification={item} />
                )}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const NoNotifications = () => {
    return (
        <View style={[styles.container, styles.centered]}>
            <Ionicons
                name="notifications-outline"
                size={48}
                color={colors.primary}
            />
            <Text style={{ color: colors.white, fontSize: 20 }}>
                You have no notifications
            </Text>
        </View>
    );
};
