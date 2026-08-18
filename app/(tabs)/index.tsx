import "@/global.css";
import { Image, Text, View, FlatList, Pressable } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useState } from "react";
import { useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/context/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const { homeSubscriptions, addSubscription } = useSubscriptions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useUser();
  const posthog = usePostHog();

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    HOME_USER.name;

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="home-avatar" />
                ) : (
                  <Image source={images.avatar} className="home-avatar" />
                )}
                <Text className="home-user-name" numberOfLines={1}>
                  {userName}
                </Text>
              </View>
              <Pressable
                onPress={() => setIsModalVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state"> No upcoming renewals yet.</Text>
                }
              />
            </View>
            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={homeSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              posthog?.capture("subscription_details_toggled", {
                is_expanding: isExpanding,
              });
              setExpandedSubscriptionId(isExpanding ? item.id : null);
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}

