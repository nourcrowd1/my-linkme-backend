import Mailer from "../vendors/emailer";
import jwt from "jsonwebtoken";
import moment from "moment";

import User from "../entities/User";
import Admin from "../entities/Admin";
import Token from "../entities/Token";
import { InputError, NotFoundError } from "../errors";

import { ILike } from "typeorm";
import {fileRenderer} from "../amp/renderer";

export default {
  Mutation: {
    validateAccount: async (_, values) => {
      const result = {};
      try {
        const { email, username } = User.validate(values, -1);
        if (email && (await User.count({ email })))
          result["email"] = "already_exists";
        if (username && (await User.count({ username })))
          result["username"] = "already_exists";
      } catch (error) {
        if ("field" in error) result[error.field] = error.reason;
        else throw error;
      }
      return result;
    },
    createAccount: async (_, { input }, ctx) => {
      const { user, token } = await User.createAccount(input);
      ctx.user = user;
      return { user, token };
    },
    login: async (
      _,
      { email, password }: { email: string; password: string },
      ctx
    ) => {
      const { user, token } = await User.checkCredentials({ email, password });
      ctx.user = user;
      return { user, token };
    },
    updateAccount: (_, { input }, { user }: { user: User }) => {
      return User.updateAccount(user.id, input);
    },
    updateAccountWithoutSubscription: (_, { input }, { user }: { user: User }) => {
      return User.updateAccount(user.id, input);
    },
    deleteAccount: (_, __, { user }) => {
      return User.delete({ id: user.id });
    },
    changePassword: (_, { input }, { user }: { user: User }) => {
      try {
        const {currentPassword, password} = input;
        return User.changePassword(user.id, currentPassword, password);
      }
      catch (error) {
        throw error;
      }
    },
    sendRestorePasswordEmail: async (_, { input }, { user }: { user: User })  => {
        if (!user) {
          let  email = input.email;
          const user = await User.findOne({email});

          if (!user) throw new InputError("email", "email_not_found");

          const expiresMoment = moment().add(1, 'hours');

          const token = new Token();
          token.expires = expiresMoment.toISOString();
          token.user = user;
          await token.save();

          const jwtToken = jwt.sign({
            email,
            token:token.id
          }, 'secret', { expiresIn: expiresMoment.unix() });

          const params = { link:`https://link-me.io/dashboard/restore-password?jwtToken=${jwtToken}`};
          const html = await fileRenderer.renderFile("email/restore-password", params);

          let mail = {
            body:html,
            subject:'Restore password'
          };
          return await new Mailer().send(email, mail);
        }
        else {
          throw new Error('You are already signed in');
        }
    },
    changePasswordByToken: async (_, { input }) : Promise<User> => {
        const {email, token, password}: {email: string, token: string, password:string} = input;
        const userToken = await Token.findOne({id:token});

        if (Token.isTokenExpires(userToken.expires)) throw new InputError("token", "token_is_expired");
        const user = await User.findOne({email});

        if (user.email !== email)  throw new InputError("token", "email_not_found");

        return User.updateAccount(user.id, {password});

    },


  },
  Query: {
    me: (_, __, { user }) => {
      return user;
    },

    user: (_, { id }) => User.findOne(id),
    users: async (
        _,
       { input }: { input: { limit?: number; offset?: number; search?: {field:string, value:string}; order?: {field:string, direction:string} } }
    ) => {

      const { limit, offset, search, order } = input ?? {};
      const take = limit ?? 10;
      const skip = offset ?? 0;

      const items = await User.findAndCount({
        skip,
        take,
        order: order ? {[order.field]:order.direction} : {id:"DESC"},
        where: search ? {[search.field]: ILike(`%${search.value}%`)} : null,
        relations:['subscription']
      });

      return { items:items[0], nextOffset: items[0].length === take ? skip + take : null, total:items[1] };
    },
  },
  User: {
    email: (obj: User, _, { user, admin }: { user?: User; admin?: Admin }) => {
      return obj.email;
      if (admin?.id || obj.id === user?.id) return obj.email;
      return null;
    },
  },
};
