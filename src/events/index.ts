import SubscriptionUpdated from "./actions/SubscriptionUpdated";
import SubscriptionCanceled from "./actions/SubscriptionCanceled";

import PaymentCreated from "./actions/PaymentCreated";

export const actions = {
  "paypal.BILLING.SUBSCRIPTION.ACTIVATED": SubscriptionUpdated,
  "paypal.BILLING.SUBSCRIPTION.CANCELLED": SubscriptionCanceled,
  "paypal.BILLING.SUBSCRIPTION.CREATED": SubscriptionUpdated,
  "paypal.BILLING.SUBSCRIPTION.EXPIRED": SubscriptionUpdated,
  // "paypal.BILLING.SUBSCRIPTION.UPDATED": SubscriptionUpdated,
  "paypal.BILLING.SUBSCRIPTION.RE-ACTIVATED": SubscriptionUpdated,
  "paypal.PAYMENT.SALE.COMPLETED": PaymentCreated,
};

export type EventType = keyof typeof actions;

export { default as triggerEvent } from "./trigger";
