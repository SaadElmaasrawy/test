import React from 'react';
import { View, Text } from 'react-native';

export interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View className="items-center mb-6">
      {/* Recurly Brand Badge & Wordmark */}
      <View className="flex-row items-center gap-3.5 mb-7">
        <View className="w-14 h-14 rounded-2xl bg-accent items-center justify-center shadow-sm">
          <Text className="text-3xl font-sans-extrabold text-background">R</Text>
        </View>
        <View className="justify-center">
          <Text className="text-3xl font-sans-extrabold text-primary tracking-tight">Recurly</Text>
          <Text className="text-xs font-sans-bold uppercase tracking-[1.5px] text-muted-foreground -mt-0.5">
            SMART BILLING
          </Text>
        </View>
      </View>

      {/* Screen Title & Subtitle */}
      <Text className="text-3xl font-sans-bold text-primary text-center tracking-tight">
        {title}
      </Text>
      <Text className="text-base font-sans-medium text-muted-foreground text-center mt-2 px-3 leading-6">
        {subtitle}
      </Text>
    </View>
  );
}
