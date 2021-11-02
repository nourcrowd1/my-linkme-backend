import requiresUser from "./requiresUser";

export default {
  requiresAuthorized(next, src, args, ctx, info) {
    if (ctx.user?.id || ctx.admin) return next();
    return requiresUser.requiresUser(next, src, args, ctx, info);
  },
};
