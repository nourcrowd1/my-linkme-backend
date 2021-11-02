import { NotAuthorizedError } from "../errors";
export default {
  requiresAdmin: async (next, src, args, ctx, info) => {
    if (ctx.admin) return next();
    throw new NotAuthorizedError();
  },
};
