import {InputError, NotFoundError, NotAuthorizedError} from "../errors";
import PayPal from "../vendors/paypal";

import User from "../entities/User";
import Payment from "../entities/Payment";
export default {
    Query: {
        payments: async (
            _,
            __,
            { user }: { user: User }
        ) => {
            return await Payment.find({user});
        },
    },
};
