import { fileRenderer } from "../renderer";

/**
 * Load static pages and serve them from memory
 */
export default async function makeStaticPages() {
  const pages = new Map<string, string>();
  for (let page of ["landing", "error-page", "not-found", "freeze"]) {
    pages.set(page, await fileRenderer.renderFile("pages/" + page));
  }
  return pages;
}
