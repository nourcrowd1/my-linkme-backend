import Token from "../entities/Token";
import {NotAuthorizedError} from "../errors";

export async function requiresUser(next, src, args, ctx, info) {
  if (ctx.user?.id) return next();
  if (!ctx.token) throw new NotAuthorizedError();
  const token: Token = await Token.findOne(ctx.token.trim()).catch(() => null);
  if (!token?.id) throw new NotAuthorizedError();
  if (token.expires <= Date.now()) {
    await Token.remove(token);
    throw new NotAuthorizedError();
  }
  ctx.user = token.user;
  if (!ctx.user) throw new NotAuthorizedError();

  return next();
}

export default {
  requiresUser,
};
