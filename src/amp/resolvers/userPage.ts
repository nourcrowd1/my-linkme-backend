import User from "../../entities/User";
import { fileRenderer } from "../renderer";
import { get, filter } from "lodash";
import Subscription from "../../entities/Subscription";
import any = jasmine.any;
import {buildLinkWithSublinks} from "../../lib";
export default async function userPage(path: string, options: {currentUser: {} | null}) {
  const user = await User.findOne({ username: path.replace(/\//gi, "") });
  if (!user?.id) return {html:null};

  const isCurrentUserPageOwner = user.id === get(options.currentUser, 'id');
  const isSubscriptionActive = await Subscription.isUserSubscriptionActive(user);
  if (!isSubscriptionActive || user.isFreeze) return {html:null, redirect:'/'};

  let { username, intro, links, avatar, id, lang, name } = user;
  if (!user.enable_partner_links) links = filter(links, link => link.type !== 'crowd1');

  links =  buildLinkWithSublinks(links);
  const url = (process.env.APP_URL ?? "/") + username;

  let params = { username, intro, links, avatar, id, url, lang, useAnalytics: true, name};
  let template = user.template ?? user.theme?.template;

  if (isCurrentUserPageOwner) params.useAnalytics = false;
  if (!template) return {html:await fileRenderer.renderFile("themes/default", params)};
  return {html: await fileRenderer.renderText(template, params)};
}
