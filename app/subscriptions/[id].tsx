import { View, Text } from 'react-native';
import React from 'react';
import { Link, useLocalSearchParams } from 'expo-router';

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-background p-5">
      <Text className="text-xl font-sans-bold text-primary mb-4">Subscription Details: {id}</Text>
      <Link href="/(tabs)" className="text-base font-sans-bold text-accent">Go Back</Link>
    </View>
  );
};

export default SubscriptionDetails;