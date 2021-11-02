import Subscription from "../../entities/Subscription";
import User from "../../entities/User";

export default async function SubscriptionUpdated(event: Record<string, any>) {
  let user;
  const resource = event.resource;
  let subscription = await Subscription.findOne({
    ext_id: resource.id,
    origin: "paypal",
  });
  if (resource.custom_id) {
    user = await User.findOne(resource.custom_id, {relations:['subscription']});
  }

  if (!subscription?.id) {
    subscription = new Subscription();
    subscription.origin = "paypal";
    subscription.ext_id = resource.id;

  }
  if (user) {
    subscription.user = user;
    if (!subscription.user?.id) {
      console.error("Could no find user for a subscription", resource);
      return;
    }
  }
  subscription.plan_id = resource.plan_id;
  subscription.start_time = new Date(resource.start_time);
  subscription.end_time = resource.end_time && new Date(resource.end_time);
  subscription.status = resource.status.toLowerCase();
  subscription.status_change_note = resource.status_change_note;
  await subscription.save();
  if (user && !user.subscription) {
    user.subscription = subscription;
    await user.save();
  }

  return subscription;
}
