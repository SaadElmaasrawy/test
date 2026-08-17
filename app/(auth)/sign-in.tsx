import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useSignIn, useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import AuthHeader from '@/components/AuthHeader';
import AuthInput from '@/components/AuthInput';

const getErrorMessage = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  if (err.errors && Array.isArray(err.errors) && err.errors[0]) {
    return err.errors[0].longMessage || err.errors[0].message || 'An error occurred.';
  }
  return err.message || 'An unexpected error occurred.';
};

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { isLoaded } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Forgot password modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn.password({
        identifier: email.trim(),
        password,
      });

      if (error) {
        setServerError(getErrorMessage(error));
        setLoading(false);
        return;
      }

      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setServerError(getErrorMessage(finalizeError));
        setLoading(false);
        return;
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!isLoaded || !signIn) return;
    setResetError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetEmail.trim() || !emailRegex.test(resetEmail.trim())) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);

    try {
      const { error: createError } = await signIn.create({
        identifier: resetEmail.trim(),
      });

      if (createError) {
        setResetError(getErrorMessage(createError));
        setResetLoading(false);
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setResetError(getErrorMessage(sendError));
        setResetLoading(false);
        return;
      }

      setResetStep('verify');
    } catch (err: any) {
      setResetError(getErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyPasswordReset = async () => {
    if (!isLoaded || !signIn) return;
    setResetError(null);

    if (!resetCode.trim()) {
      setResetError('Please enter the verification code.');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }

    setResetLoading(true);

    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code: resetCode.trim(),
      });

      if (verifyError) {
        setResetError(getErrorMessage(verifyError));
        setResetLoading(false);
        return;
      }

      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });

      if (submitError) {
        setResetError(getErrorMessage(submitError));
        setResetLoading(false);
        return;
      }

      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setResetError(getErrorMessage(finalizeError));
        setResetLoading(false);
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        setIsResetOpen(false);
        router.replace('/(tabs)');
      }, 1200);
    } catch (err: any) {
      setResetError(getErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff9e3' }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 32,
            justifyContent: 'space-between',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Header */}
            <AuthHeader
              title="Welcome back"
              subtitle="Sign in to continue managing your subscriptions"
            />

            {/* Server Error Notification */}
            {serverError && (
              <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
                <Ionicons name="alert-circle" size={22} color="#dc2626" />
                <Text className="flex-1 text-xs font-sans-medium text-destructive leading-5">
                  {serverError}
                </Text>
                <TouchableOpacity
                  onPress={() => setServerError(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}

            {/* Form Card */}
            <View className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <View className="gap-5">
                <AuthInput
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  error={fieldErrors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View className="gap-1">
                  <AuthInput
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    error={fieldErrors.password}
                    isPassword
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setResetEmail(email);
                      setResetError(null);
                      setResetStep('request');
                      setResetSuccess(false);
                      setIsResetOpen(true);
                    }}
                    className="self-end pt-1"
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs font-sans-semibold text-accent">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={loading || !isLoaded}
                  activeOpacity={0.85}
                  className={`mt-2 h-14 items-center justify-center rounded-2xl bg-accent ${
                    loading || !isLoaded ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="text-base font-sans-bold text-primary">
                      Sign in
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Link */}
          <View className="mt-8 flex-row items-center justify-center gap-1.5 py-4">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              New to Recurly?
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-sm font-sans-bold text-accent">
                  Create an account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={isResetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsResetOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl border-t border-border bg-background p-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <Text className="text-xl font-sans-bold text-primary">
                {resetStep === 'request' ? 'Reset Password' : 'Verify Code'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsResetOpen(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-muted"
              >
                <Ionicons name="close" size={18} color="#081126" />
              </TouchableOpacity>
            </View>

            {resetError && (
              <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-destructive/10 p-3">
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text className="flex-1 text-xs font-sans-medium text-destructive">
                  {resetError}
                </Text>
              </View>
            )}

            {resetSuccess && (
              <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-success/15 p-3">
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                <Text className="flex-1 text-xs font-sans-medium text-success">
                  Password reset successfully! Signing you in...
                </Text>
              </View>
            )}

            {resetStep === 'request' ? (
              <View className="mt-5 gap-4">
                <Text className="text-sm font-sans-medium text-muted-foreground leading-5">
                  {"Enter your email address and we'll send you a verification code to reset your password."}
                </Text>
                <AuthInput
                  label="Email"
                  placeholder="Enter your account email"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={handleRequestPasswordReset}
                  disabled={resetLoading}
                  className="mt-2 h-13 items-center justify-center rounded-2xl bg-accent"
                >
                  {resetLoading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="text-base font-sans-bold text-primary">
                      Send Reset Code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mt-5 gap-4">
                <Text className="text-sm font-sans-medium text-muted-foreground leading-5">
                  Enter the 6-digit code sent to <Text className="font-sans-bold text-primary">{resetEmail}</Text> and choose a new password.
                </Text>
                <AuthInput
                  label="Verification Code"
                  placeholder="6-digit code"
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <AuthInput
                  label="New Password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  isPassword
                />
                <TouchableOpacity
                  onPress={handleVerifyPasswordReset}
                  disabled={resetLoading || resetSuccess}
                  className="mt-2 h-13 items-center justify-center rounded-2xl bg-accent"
                >
                  {resetLoading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="text-base font-sans-bold text-primary">
                      Update Password & Sign In
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setResetStep('request')}
                  className="items-center py-2"
                >
                  <Text className="text-xs font-sans-semibold text-muted-foreground">
                    Change email address
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}