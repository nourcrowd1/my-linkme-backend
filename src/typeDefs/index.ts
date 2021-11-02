import { mergeTypeDefs } from "graphql-tools";
import directives from "./directives";
import Links from "./Links";
import Themes from "./Themes";
import Users from "./Users";
import Images from "./Images";
import Operations from "./Operations";
import Layouts from "./Layouts";
import Styles from "./Styles";
import Pages from "./Pages";
import Admins from "./Admins";
import OAuth from "./OAuth";
import Subscription from "./Subscription";
import Analytics from "./Analytics";
import Payments from "./Payments";
import Partner from "./Partner";
import PartnerLinks from "./PartnerLinks";

export default mergeTypeDefs([
  directives,
  Operations,
  Images,
  Links,
  Users,
  Themes,
  Layouts,
  Styles,
  Pages,
  Admins,
  OAuth,
  Subscription,
  Analytics,
  Payments,
  Partner,
  PartnerLinks
]);
