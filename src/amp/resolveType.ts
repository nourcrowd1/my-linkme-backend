import { URL } from "url";
import Page from "../entities/Page";

export enum PageType {
  landing, // Core page with languages selector. Static file
  user_page, // Page with user links and profile. Stored in a database
  site_page, // Scoped locale page, Stored in a database
}
export async function resolveType(url: URL): Promise<PageType> {
  if (!url.pathname) url.pathname = '/';
  //if (!url.pathname || url.pathname === "/") return PageType.landing;
  const sitePages = await Page.findOne({path:url.pathname});
  return sitePages ? PageType.site_page : PageType.user_page;
}
