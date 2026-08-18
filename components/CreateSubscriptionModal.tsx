import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import { posthog } from "@/lib/posthog";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#fbcfe8",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#c7d2fe",
  Music: "#fed7aa",
  Other: "#e2e8f0",
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState<string>("Entertainment");

  const parsedPrice = parseFloat(price);
  const isValid =
    name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const startDate = dayjs().toISOString();
    const renewalDate = dayjs()
      .add(1, frequency === "Yearly" ? "year" : "month")
      .toISOString();

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: icons.wallet,
      billing: frequency,
      color: CATEGORY_COLORS[category] || "#e2e8f0",
      currency: "USD",
    };

    onSubmit(newSubscription);

    posthog?.capture("subscription created", {
      "Subscription Name": newSubscription.name,
      "Price": newSubscription.price,
      "Frequency": frequency,
      "Category": category,
    });

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="modal-overlay justify-end"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="modal-container">
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                className="modal-close"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#081126" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              className="modal-body"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 20, paddingBottom: 24 }}
            >
              {/* Name Field */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  placeholder="e.g. Netflix, Spotify"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Price Field */}
              <View className="auth-field">
                <Text className="auth-label">Price ($)</Text>
                <TextInput
                  className="auth-input"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Frequency Toggle */}
              <View className="auth-field">
                <Text className="auth-label">Billing Frequency</Text>
                <View className="picker-row">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setFrequency("Monthly")}
                    className={clsx(
                      "picker-option",
                      frequency === "Monthly" && "picker-option-active"
                    )}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Monthly" && "picker-option-text-active"
                      )}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setFrequency("Yearly")}
                    className={clsx(
                      "picker-option",
                      frequency === "Yearly" && "picker-option-active"
                    )}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Yearly" && "picker-option-text-active"
                      )}
                    >
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Chips */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        activeOpacity={0.7}
                        onPress={() => setCategory(cat)}
                        className={clsx(
                          "category-chip",
                          isSelected && "category-chip-active"
                        )}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            isSelected && "category-chip-text-active"
                          )}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!isValid}
                onPress={handleSubmit}
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled"
                )}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
