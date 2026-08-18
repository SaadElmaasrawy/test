import { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { View, ActivityIndicator } from "react-native";
import {
  PostHogErrorBoundary,
  PostHogProvider,
  usePostHog,
} from "posthog-react-native";

import "@/global.css";
import { posthog } from "@/lib/posthog";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable.");
}

function InitialLayout({ fontsReady }: { fontsReady: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const posthogClient = usePostHog();
  const identifiedUserId = useRef<string | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isUserLoaded || !isSignedIn || !user?.id) {
      identifiedUserId.current = null;
      return;
    }

    if (identifiedUserId.current === user.id) return;

    posthogClient?.identify(user.id, {
      $set: {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? user.firstName,
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, isSignedIn, isUserLoaded, posthogClient, user]);

  useEffect(() => {
    if (!fontsReady || !isLoaded) return;

    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded, fontsReady, segments, router]);

  if (!fontsReady || !isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff9e3",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ea7a53" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff9e3" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  const content = (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <InitialLayout fontsReady={fontsReady} />
    </ClerkProvider>
  );

  return posthog ? (
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary>{content}</PostHogErrorBoundary>
    </PostHogProvider>
  ) : (
    content
  );
}
