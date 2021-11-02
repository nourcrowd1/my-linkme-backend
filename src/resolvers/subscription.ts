import User from "../entities/User";
import {NotFoundError, HTTPError, NotAuthorizedError, InputError} from "../errors";
import SubscriptionUpdated from "../events/actions/SubscriptionUpdated";
import paypal, {PayPal} from "../vendors/paypal";
import {Like} from "typeorm";
import Subscription from "../entities/Subscription";
import {find} from "lodash";
import {paypal as paypalConfig} from "../config";

export default {
  Mutation: {
    activateSubscription: async (
        _,
        {input}: { input: { id: string, plan_id: string } },
        {user}: { user: User }
    ) => {
      const id = input.id;
      const resource = await paypal.execute({
        method: "GET",
        path: `/v1/billing/subscriptions/${id}`,
      });

      if (!resource) throw new NotFoundError("subscription", "not_found");
      resource.custom_id = user.id;
      return await SubscriptionUpdated({resource});
    },
    changePayPalSubscriptionPlan: async (
        _,
        {id, plan_id}: { id: string, plan_id: string },
        {user}: { user: User }
    ) => {
      let subscription = await Subscription.findOne({
        user: user,
        origin: "paypal",
        ext_id: id
      });

      if (!subscription?.id) throw new NotFoundError('subscription', 'no_subscription');

      const resource = await paypal.updatePlan(id, plan_id);

      if (!resource) throw new NotFoundError("subscription", "not_found");
      if (!resource.plan_id) throw new HTTPError(403, "plan_not_changed");
      return find(resource.links, {rel:'approve'});
    },
    cancelSubscription: async (
        _,
        {id}: { id: string },
        {user}: { user: User }
    ) => {
      const result = await Subscription.cancelPayPalSubscriptionByID(id, user);
      if (result.error) return new HTTPError(403, result.error);

      return true;
    }
    },
    Query: {
      currentSubscription: async (_, __, {user}) => {
        return await Subscription.findOne({user}, {relations:['payments']});
      },
      paypalPlans: async (_, __, ___) => {
        let path = `/v1/billing/plans`;
        if (paypalConfig.productID) path += `?product_id=${paypalConfig.productID}`;

        const result = await paypal.execute({
          method: "GET",
          path: path,
        });

        if (result?.plans) {
          for (let index in result.plans) {
            const plan = await paypal.execute({
              method: "GET",
              path: `/v1/billing/plans/${result.plans[index].id}`,
            });
            let cycle = find(plan.billing_cycles, {tenure_type: 'REGULAR'});
            if (cycle) {
              plan.amount = cycle.pricing_scheme.fixed_price.value;
              plan.currency = cycle.pricing_scheme.fixed_price.currency_code;
              plan.interval = cycle.frequency.interval_unit;
              result.plans[index] = plan;
            } else {
              result.plans[index] = {};
            }
          }
        }

        return result?.plans;
      }
    },
};
