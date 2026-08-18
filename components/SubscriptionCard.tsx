import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils';
import { clsx } from 'clsx';

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  renewalDate,
  category,
  plan,
  onPress,
  expanded,
  paymentMethod,
  startDate,
  status,
  onCancelPress,
  isCancelling,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" resizeMode="contain" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {plan?.trim() || category?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-expanded mt-4 gap-4">
          <View className="sub-details">
            {paymentMethod ? (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Payment info:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {paymentMethod.trim()}
                  </Text>
                </View>
                <View className="rounded-full border border-primary/40 px-4 py-1">
                  <Text className="text-sm font-sans-medium text-primary">Manage</Text>
                </View>
              </View>
            ) : null}

            {plan ? (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Plan details:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {plan.trim()}
                  </Text>
                </View>
                <View className="rounded-full border border-primary/40 px-4 py-1">
                  <Text className="text-sm font-sans-medium text-primary">Change</Text>
                </View>
              </View>
            ) : null}

            {category && !plan ? (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Category:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {category.trim()}
                  </Text>
                </View>
              </View>
            ) : null}

            {startDate ? (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Started:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {formatSubscriptionDateTime(startDate)}
                  </Text>
                </View>
              </View>
            ) : null}

            {renewalDate ? (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Renewal date:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {formatSubscriptionDateTime(renewalDate)}
                  </Text>
                </View>
              </View>
            ) : null}

            {status ? (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Status:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {formatStatusLabel(status)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {onCancelPress && (
            <Pressable
              onPress={onCancelPress}
              disabled={isCancelling}
              className={clsx('sub-cancel', isCancelling && 'sub-cancel-disabled')}
            >
              <Text className="sub-cancel-text">
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;