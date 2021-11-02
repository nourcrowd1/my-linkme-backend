import Subscription from "../entities/Subscription";
import { NotAuthorizedError } from "../errors";
import { requiresUser } from "./requiresUser";

export default {
  requiresSubscription: async (next, src, args, ctx, info) => {
    return requiresUser(
      async () => {
        if (!ctx.user?.id) new NotAuthorizedError("access_denied");
        const isSubscriptionActive = await Subscription.isUserSubscriptionActive(ctx.user);
        if (!isSubscriptionActive)
          throw new NotAuthorizedError("requires_subscription");
        return next();
      },
      src,
      args,
      ctx,
      info
    );
  },
};
