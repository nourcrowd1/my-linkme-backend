import { mergeResolvers } from "graphql-tools";
import requiresAdmin from "./requiresAdmin";
import requiresAuthorized from "./requiresAuthorized";
import requiresSubscription from "./requiresSubscription";
import requiresUser from "./requiresUser";

export default mergeResolvers([
  requiresAdmin,
  requiresUser,
  requiresSubscription,
  requiresAuthorized,
]);
