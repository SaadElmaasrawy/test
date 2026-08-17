import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clsx } from 'clsx';

export interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export default function AuthInput({
  label,
  error,
  isPassword = false,
  ...props
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="gap-2">
      <Text className="text-sm font-sans-semibold text-primary">{label}</Text>
      <View
        className={clsx(
          'flex-row items-center rounded-2xl border bg-background px-4 py-3.5',
          error
            ? 'border-destructive bg-destructive/5'
            : isFocused
            ? 'border-accent'
            : 'border-border'
        )}
      >
        <TextInput
          className="flex-1 text-base font-sans-medium text-primary py-0"
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          autoCorrect={!isPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="pl-2"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-xs font-sans-medium text-destructive mt-0.5">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
