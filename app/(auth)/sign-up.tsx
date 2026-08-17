import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useSignUp, useAuth } from '@clerk/expo';
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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const { isLoaded } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    code?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Resend cooldown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    const errors: { fullName?: string; email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { error: signUpError } = await signUp.password({
        emailAddress: email.trim(),
        password,
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      });

      if (signUpError) {
        setServerError(getErrorMessage(signUpError));
        setLoading(false);
        return;
      }

      const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
      if (sendCodeError) {
        setServerError(getErrorMessage(sendCodeError));
        setLoading(false);
        return;
      }

      setIsVerifying(true);
      setResendCooldown(30);
    } catch (err: any) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    setServerError(null);

    if (!code.trim() || code.trim().length < 4) {
      setFieldErrors({ code: 'Please enter the verification code' });
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (verifyError) {
        setServerError(getErrorMessage(verifyError));
        setLoading(false);
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
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

  const handleResendCode = async () => {
    if (!isLoaded || !signUp || resendCooldown > 0) return;
    setServerError(null);
    setResendLoading(true);

    try {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setServerError(getErrorMessage(sendError));
        return;
      }
      setResendCooldown(30);
    } catch (err: any) {
      setServerError(getErrorMessage(err));
    } finally {
      setResendLoading(false);
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
              title={isVerifying ? 'Verify your email' : 'Create account'}
              subtitle={
                isVerifying
                  ? `Enter the verification code sent to ${email}`
                  : 'Start managing and optimizing your recurring subscriptions'
              }
            />

            {/* Server Error Alert */}
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

            {/* Card Form */}
            <View className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              {!isVerifying ? (
                <View className="gap-4">
                  <AuthInput
                    label="Full Name"
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (fieldErrors.fullName) {
                        setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    error={fieldErrors.fullName}
                    autoCapitalize="words"
                  />

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

                  <AuthInput
                    label="Password"
                    placeholder="Create a strong password"
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

                  {/* Password requirement helper */}
                  <View className="flex-row items-center gap-1.5 px-1">
                    <Ionicons
                      name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={password.length >= 8 ? '#16a34a' : '#9ca3af'}
                    />
                    <Text
                      className={`text-xs font-sans-medium ${
                        password.length >= 8 ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      Must be at least 8 characters
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleSignUp}
                    disabled={loading || !isLoaded}
                    activeOpacity={0.85}
                    className={`mt-3 h-14 items-center justify-center rounded-2xl bg-accent ${
                      loading || !isLoaded ? 'opacity-70' : 'opacity-100'
                    }`}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" size="small" />
                    ) : (
                      <Text className="text-base font-sans-bold text-primary">
                        Create account
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                /* Verification Screen */
                <View className="gap-5">
                  <View className="items-center py-2">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-accent/15 mb-3">
                      <Ionicons name="mail-unread-outline" size={32} color="#ea7a53" />
                    </View>
                    <Text className="text-sm font-sans-medium text-center text-muted-foreground">
                      We sent a 6-digit confirmation code to
                    </Text>
                    <Text className="text-sm font-sans-bold text-primary mt-0.5">
                      {email}
                    </Text>
                  </View>

                  <AuthInput
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChangeText={(text) => {
                      setCode(text);
                      if (fieldErrors.code) {
                        setFieldErrors((prev) => ({ ...prev, code: undefined }));
                      }
                    }}
                    error={fieldErrors.code}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />

                  <TouchableOpacity
                    onPress={handleVerify}
                    disabled={loading || !isLoaded}
                    activeOpacity={0.85}
                    className={`h-14 items-center justify-center rounded-2xl bg-accent ${
                      loading || !isLoaded ? 'opacity-70' : 'opacity-100'
                    }`}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" size="small" />
                    ) : (
                      <Text className="text-base font-sans-bold text-primary">
                        Verify & Continue
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View className="flex-row items-center justify-between pt-1">
                    <TouchableOpacity
                      onPress={() => {
                        setIsVerifying(false);
                        setServerError(null);
                      }}
                      className="py-2"
                    >
                      <Text className="text-xs font-sans-semibold text-muted-foreground">
                        Edit email
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={resendCooldown > 0 || resendLoading}
                      className="py-2"
                    >
                      <Text
                        className={`text-xs font-sans-semibold ${
                          resendCooldown > 0
                            ? 'text-muted-foreground'
                            : 'text-accent'
                        }`}
                      >
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : resendLoading
                          ? 'Sending...'
                          : 'Resend code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Bottom Link */}
          <View className="mt-8 flex-row items-center justify-center gap-1.5 py-4">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Already have an account?
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-sm font-sans-bold text-accent">
                  Sign in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}