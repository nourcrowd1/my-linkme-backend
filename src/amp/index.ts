import {ServerResponse } from "http";
import { URL } from "url";
import ampCors from "amp-toolbox-cors";
import { PageType, resolveType } from "./resolveType";
import makeStaticPages from "./resolvers/staticPages";
import userPage from "./resolvers/userPage";
import sitePage from "./resolvers/sitePage";
import {IncomingMessageLinkTree} from "../classes";

/**
 * AMP Middleware
 * Renders all types of pages
 * @param context
 */
export default async function makeAMPRenderer(context: any) {
  const AMPCORS = ampCors();
  const pages = await makeStaticPages();

  return (req: IncomingMessageLinkTree, res: ServerResponse) => {
    return AMPCORS(req, res, async () => {
      try {
        res.statusCode = 200;
        const url = new URL(req.url, "http://localhost");
        const pageType = await resolveType(url);
        let result = {html:null};
        switch (pageType) {
          case PageType.landing: {
            result.html = pages.get("landing");
            break;
          }
          case PageType.user_page: {
            result = await userPage(url.pathname, {currentUser:req.user});
            break;
          }
          case PageType.site_page: {
            result = await sitePage(url.pathname, {currentUser:req.user});
            break;
          }
        }

        if (result && result['redirect']) return redirect(res, result['redirect']);

        res.statusCode = 200;
        if (!result.html) {
          res.statusCode = 404;
          result.html = pages.get("not-found");
        }
        return sendHTML(result.html, res, req);
      } catch (error) {
        res.statusCode = 500;
        console.error(error);
        return sendHTML(pages.get("error-page"), res, req);
      }
    });
  };
}

export async function sendHTML(html: string, res, req)  {
  res.setHeader("content-type", "text/html");
  res.setHeader("content-length", html.length);
  if (["OPTIONS", "HEAD"].includes(req.method)) return res.end();
  return res.end(html);
}

function redirect(res, place) {
  res.statusCode = 301;
  res.setHeader("Location", place);
  return res.end();
}