import Payment from "../../entities/Payment";
import User from "../../entities/User";
import Subscription from "../../entities/Subscription";

export default async function PaymentCreated(event: Record<string, any>) {
    try {
        const resource = event.resource;
        //TODO add check for subsciption id
        const paypalSubscription = await Subscription.findOne({ext_id: resource.billing_agreement_id}, {relations: ['user'],});
        if (paypalSubscription?.user) {
            let payment = new Payment();
            payment.user = paypalSubscription.user;
            payment.status = resource.state;
            payment.total_amount = +resource.amount.total;
            payment.currency = resource.amount.currency;
            payment.create_time = resource.create_time;
            payment.billing = paypalSubscription;

            await payment.save();

        }
        return paypalSubscription;
    }
    catch (err) {
        throw err;
    }

}
