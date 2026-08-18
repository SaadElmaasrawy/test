import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import SubscriptionCard from '@/components/SubscriptionCard';
import { formatCurrency } from '@/lib/utils';
import { useSubscriptions } from '@/context/SubscriptionsContext';

const CATEGORIES = [
  'All',
  'Active',
  'Design',
  'Developer Tools',
  'AI Tools',
  'Cloud Storage',
  'Entertainment',
  'Productivity',
];

const SubscriptionsScreen = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { allSubscriptions, updateSubscriptionStatus } = useSubscriptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filter subscriptions based on search query and category
  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allSubscriptions.filter((sub) => {
      // Category / Status filter
      let matchesCategory = true;
      if (selectedCategory === 'Active') {
        matchesCategory = sub.status === 'active';
      } else if (selectedCategory !== 'All') {
        matchesCategory =
          sub.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          sub.plan?.toLowerCase() === selectedCategory.toLowerCase();
      }

      if (!matchesCategory) return false;

      // Text search filter
      if (!query) return true;

      const nameMatch = sub.name.toLowerCase().includes(query);
      const planMatch = sub.plan?.toLowerCase().includes(query) ?? false;
      const categoryMatch = sub.category?.toLowerCase().includes(query) ?? false;
      const billingMatch = sub.billing.toLowerCase().includes(query);
      const statusMatch = sub.status?.toLowerCase().includes(query) ?? false;
      const paymentMatch = sub.paymentMethod?.toLowerCase().includes(query) ?? false;

      return nameMatch || planMatch || categoryMatch || billingMatch || statusMatch || paymentMatch;
    });
  }, [searchQuery, selectedCategory, allSubscriptions]);

  // Calculate total monthly expense for filtered subscriptions
  const totalCost = useMemo(() => {
    return filteredSubscriptions.reduce((acc, curr) => acc + curr.price, 0);
  }, [filteredSubscriptions]);

  const handleCancelSubscription = (sub: Subscription) => {
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel your ${sub.name} subscription?`,
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            setCancellingId(sub.id);
            posthog?.capture('subscription_cancelled', {
              subscription_id: sub.id,
              subscription_name: sub.name,
            });

            setTimeout(() => {
              updateSubscriptionStatus(sub.id, 'cancelled');
              setCancellingId(null);
              Alert.alert('Subscription Cancelled', `Your subscription to ${sub.name} has been cancelled.`);
            }, 600);
          },
        },
      ]
    );
  };

  const handleMoreOptions = () => {
    Alert.alert('Subscriptions Menu', 'Manage your subscriptions and payment methods.', [
      {
        text: 'Show Active Only',
        onPress: () => setSelectedCategory('Active'),
      },
      {
        text: 'Reset Filters',
        onPress: () => {
          setSelectedCategory('All');
          setSearchQuery('');
        },
      },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff9e3' }}
      edges={['top', 'left', 'right']}
    >
      <View className="flex-1 px-5 pt-2">
        {/* Header matching design mockup */}
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="size-12 items-center justify-center rounded-full border border-black/10 bg-card shadow-sm"
          >
            <Ionicons name="chevron-back" size={22} color="#081126" />
          </TouchableOpacity>

          <Text className="text-2xl font-sans-bold text-primary">
            My Subscriptions
          </Text>

          <TouchableOpacity
            onPress={handleMoreOptions}
            activeOpacity={0.7}
            className="size-12 items-center justify-center rounded-full border border-black/10 bg-card shadow-sm"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#081126" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <Feather name="search" size={18} color="rgba(0,0,0,0.4)" />
          <TextInput
            placeholder="Search subscriptions, plans, categories..."
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length > 2) {
                posthog?.capture('subscriptions_searched', { query: text });
              }
            }}
            className="ml-3 flex-1 text-base font-sans-medium text-primary"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="size-6 items-center justify-center rounded-full bg-muted"
            >
              <Ionicons name="close" size={14} color="#081126" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setSelectedCategory(cat);
                    posthog?.capture('subscription_category_filtered', { category: cat });
                  }}
                  activeOpacity={0.7}
                  className={`rounded-full px-4 py-2 border ${
                    isActive
                      ? 'border-accent bg-accent/15'
                      : 'border-border bg-card'
                  }`}
                >
                  <Text
                    className={`text-sm font-sans-semibold ${
                      isActive ? 'text-accent' : 'text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Summary Info Header */}
        <View className="mb-3 flex-row items-center justify-between px-1">
          <Text className="text-sm font-sans-semibold text-muted-foreground">
            {filteredSubscriptions.length}{' '}
            {filteredSubscriptions.length === 1 ? 'Subscription' : 'Subscriptions'}
          </Text>
          <Text className="text-sm font-sans-bold text-primary">
            Total: {formatCurrency(totalCost)}
          </Text>
        </View>

        {/* Subscriptions List */}
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              isCancelling={cancellingId === item.id}
              onPress={() => {
                const isExpanding = expandedSubscriptionId !== item.id;
                posthog?.capture('subscription_details_toggled', {
                  subscription_id: item.id,
                  is_expanding: isExpanding,
                });
                setExpandedSubscriptionId(isExpanding ? item.id : null);
              }}
              onCancelPress={() => handleCancelSubscription(item)}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListEmptyComponent={
            <View className="items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 mt-6">
              <Ionicons name="search-outline" size={44} color="rgba(0,0,0,0.3)" />
              <Text className="mt-3 text-lg font-sans-bold text-primary">
                No subscriptions found
              </Text>
              <Text className="mt-1 text-center text-sm font-sans-medium text-muted-foreground">
                {searchQuery
                  ? `No subscriptions match "${searchQuery}".`
                  : 'No subscriptions in this category.'}
              </Text>
              {(searchQuery.length > 0 || selectedCategory !== 'All') && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 rounded-full bg-accent px-5 py-2.5"
                >
                  <Text className="text-sm font-sans-bold text-white">
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;