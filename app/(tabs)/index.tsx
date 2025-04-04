import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { stories } from "@/constants/mock-data";
import Story from "@/components/Story";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import Post from "@/components/Post";

export default function Index() {
    const { signOut } = useAuth();

    const posts = useQuery(api.posts.getPosts);

    if (posts === undefined) return <Loader />;

    if (posts.length === 0) return <NoPostsFound />;

    return (
        <View style={styles.container}>
            {/* Top of the screen */}

            <View style={styles.header}>
                <Text style={styles.headerTitle}>EchoLens</Text>
                <TouchableOpacity onPress={() => signOut()}>
                    <Ionicons
                        name="log-out-outline"
                        size={24}
                        color={colors.white}
                    />
                </TouchableOpacity>
            </View>

            {/* Posts and stories */}
            <FlatList
                data={posts}
                renderItem={({ item }) => <Post post={item} />}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 64 }}
                // ListHeaderComponent={<StorySection />}
            />
        </View>
    );
}

// To be implemented later
// const StorySection = () => {
//     return (
//         <FlatList
//             data={stories}
//             renderItem={({ item }) => <Story story={item} />}
//             keyExtractor={(item) => item.id}
//             showsVerticalScrollIndicator={false}
//             horizontal
//             contentContainerStyle={styles.storiesContainer}
//         />
//     );
// };

const NoPostsFound = () => {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text style={{ fontSize: 20, color: colors.primary }}>
                No posts are found
            </Text>
        </View>
    );
};
