import React, { createContext, useContext, useState, ReactNode } from "react";
import { ALL_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS } from "@/constants/data";

interface SubscriptionsContextType {
  homeSubscriptions: Subscription[];
  allSubscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  setAllSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  updateSubscriptionStatus: (id: string, status: string) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(
  undefined
);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [homeSubscriptions, setHomeSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [allSubscriptions, setAllSubscriptions] =
    useState<Subscription[]>(ALL_SUBSCRIPTIONS);

  const addSubscription = (subscription: Subscription) => {
    setHomeSubscriptions((prev) => [subscription, ...prev]);
    setAllSubscriptions((prev) => [subscription, ...prev]);
  };

  const updateSubscriptionStatus = (id: string, status: string) => {
    setHomeSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );
    setAllSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        homeSubscriptions,
        allSubscriptions,
        addSubscription,
        setAllSubscriptions,
        updateSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider"
    );
  }
  return context;
}
