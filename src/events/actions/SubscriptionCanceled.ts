import Subscription from "../../entities/Subscription";

export default async function SubscriptionCanceled(event: Record<string, any>) {
  const resource = event.resource;
  let res = await Subscription.findAndDeleteSubscriptionFromDB(resource.id);

  return res;
}
