import Token from "../entities/Token";
import User from "../entities/User";
import google from "../vendors/google";
import jwt from "jsonwebtoken";
import {InputError} from "../errors";
import Subscription from "../entities/Subscription";
import {token as tokenConfig } from "../config";
import {Link} from "../entities/Link";
import {find, get} from "lodash";
import Partner from "../entities/Partner";
import enums from "../enums";

/**
 * {
 // These six fields are included in all Google ID Tokens.
 "iss": "https://accounts.google.com",
 "sub": "110169484474386276334",
 "azp": "1008719970978-hb24n2dstb40o45d4feuo2ukqmcc6381.apps.googleusercontent.com",
 "aud": "1008719970978-hb24n2dstb40o45d4feuo2ukqmcc6381.apps.googleusercontent.com",
 "iat": "1433978353",
 "exp": "1433981953",

 // These seven fields are only included when the user has granted the "profile" and
 // "email" OAuth scopes to the application.
 "email": "testuser@gmail.com",
 "email_verified": "true",
 "name" : "Test User",
 "picture": "https://lh4.googleusercontent.com/-kYgzyAWpZzJ/ABCDEFGHI/AAAJKLMNOP/tIXL9Ir44LE/s99-c/photo.jpg",
 "given_name": "Test",
 "family_name": "User",
 "locale": "en"
}
 */
export default {
  Mutation: {
    signInWithGoogle: async (_, { token }, ctx) => {
      const ticket = await google.verifyIdToken({
        idToken: token,
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      // TODO: we might want to limit to already registered users
      // Find a user
      const existingUser = await User.findOne({ email });
      if (existingUser?.id) {
        // Found a user with this exact email
        const token = new Token();
        token.user = existingUser;
        ctx.user = existingUser;
        await token.save();
        return { user: existingUser, token: token.id };
      }
      const user = new User();
      // Creating new user
      user.ext_id = payload["sub"];
      user.ext_provider = "google";
      user.avatar = payload.picture
          ? { url: payload.picture, width: 96, height: 96 }
          : null;
      // TODO: generate unique username
      user.username = email.split("@").shift();
      user.pwhash = "";
      user.email = email;
      user.lang = payload.locale;
      await user.save();
      const usertoken = new Token();
      usertoken.user = user;
      ctx.user = user;
      await usertoken.save();
      return { user, token: usertoken.id };
    },
    signInWithCrowd1: async (_, { token }, ctx) => {
      try {
        const parsedToken = jwt.verify(token, tokenConfig.crowdKey);
        const email = parsedToken?.['email'];

        if (!email)  throw new InputError("token", "email_not_in");

        let userName = parsedToken['username'] || `${email.split("@").shift()}`;
        let dataForCreate = {
          ext_id: parsedToken["sub"],
          ext_provider: enums.PARTNER.CROWD1,
          partnerLinksSynced:true
        };

        //TODO update user name.
        let user = await User.findOne({ ext_id:parsedToken['sub'],ext_provider:enums.PARTNER.CROWD1 });
        if (user?.id) {
          User.updateUserNameForCrowd1(user, email);
        }
        else {
          user = new User();
          user.email = email;
          user.pwhash = '';
          user.username = `@${userName}`;
          user.name = userName;
          user.enable_partner_links = true;

        }

        if (dataForCreate) {
          user = Object.assign(user, dataForCreate);
          await user.save();
        }

        if (user?.id) {
          const partner = await Partner.findByType('crowd1');
          await User.addPartner(user, partner);

          await Subscription.deleteExpiredSubscription();
          await Subscription.cancelPayPalSubscriptionByUser(user);

          const existingSubscription = await Subscription.findOne({
            user: user,
            status:'active'
          });

          if (!existingSubscription) {
            await Subscription.createPartnerSubscription({
              ext_id: user.ext_id,
              user:user,
              status:'active',
              partner
            });
          }
        }

        user = await User.findOne(user.id);

        const userToken = new Token();
        userToken.user = user;
        await userToken.save();
        ctx.user = user;

        const jwtToken = jwt.sign({
          status:true,
          sub:user.ext_id
        }, tokenConfig.crowdKey);

        return { user, token: userToken?.id, crowdToken: jwtToken};
      }
      catch (err) {
        throw new Error(err);
      }
    },
  },
};
