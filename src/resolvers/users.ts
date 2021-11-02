import User from "../entities/User";
import Subscription from "../entities/Subscription";
import {InputError} from "../errors";

export default {
  Mutation: {
    createUser: (_, { input }) => {
      return User.createUser(input);
    },
    updateUser: async (_, { id, input }) => {
      return User.updateAccount(id, input);
    },
    deleteUser: async (_, { id }: {id: number}) => {
        try {
            const user = await User.findOne(id);
            if (!user) throw new InputError('id', 'user_not_exist');
            await Subscription.cancelUserSubscription(user);
            return await User.delete(id);
        }
          catch (err) {
              throw new Error(err);
          }
    },
  deleteUserSubscription: async (_, { userId }: {userId: number}) => {
      try {
          const user = await User.findOne(userId);
          if (!user ) throw new InputError('userId', 'user_not_exist');
          return await Subscription.cancelUserSubscription(user);
      }
      catch (err) {
          throw new Error(err);
      }
  },
  }
};
