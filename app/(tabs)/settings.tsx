import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import images from '@/constants/images';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Recurly?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'Recurly Member';

  const displayEmail =
    user?.primaryEmailAddress?.emailAddress || 'No email associated';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff9e3' }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: 144 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-sans-bold text-primary mb-6">Settings</Text>

        {/* Profile Card */}
        <View className="flex-row items-center rounded-3xl border border-border bg-card p-5 mb-6 shadow-sm">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ height: 64, width: 64, borderRadius: 32 }}
            />
          ) : (
            <Image
              source={images.avatar}
              style={{ height: 64, width: 64, borderRadius: 32 }}
            />
          )}
          <View className="ml-4 flex-1">
            <Text className="text-xl font-sans-bold text-primary" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground" numberOfLines={1}>
              {displayEmail}
            </Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-xs font-sans-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Account Preferences
          </Text>
          <View className="rounded-3xl border border-border bg-card overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent/15">
                  <Ionicons name="card-outline" size={20} color="#ea7a53" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Currency
                </Text>
              </View>
              <Text className="text-sm font-sans-bold text-muted-foreground">USD ($)</Text>
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-subscription/40">
                  <Ionicons name="notifications-outline" size={20} color="#081126" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Bill Reminders
                </Text>
              </View>
              <Text className="text-sm font-sans-bold text-success">Active</Text>
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#081126" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Security & Auth
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.8}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 py-4 mt-2"
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text className="text-base font-sans-bold text-destructive">
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}