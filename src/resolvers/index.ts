import { mergeResolvers } from "graphql-tools";
import account from "./account";
import admin from "./admin";
import layouts from "./layouts";
import link from "./link";
import oauth from "./oauth";
import operations from "./operations";
import pages from "./pages";
import styles from "./styles";
import subscription from "./subscription";
import theme from "./theme";
import analytics from "./analytics";
import payments from "./payments";
import partner from "./partner";
import users from "./users";

export default mergeResolvers([
  account,
  link,
  theme,
  operations,
  admin,
  styles,
  layouts,
  pages,
  oauth,
  subscription,
  analytics,
  payments,
  partner,
  users
]);
