import { ILike } from "typeorm";
import Page from "../entities/Page";
import {fileRenderer} from "../amp/renderer";
import {HTTPError} from "../errors";

export default {
  Mutation: {
    createPage: (_, { input }) => {
      return Page.savePage(input);
    },
    updatePage: async (_, { id, input }) => {
      try {
        await Page.savePage(input, id);
        return Page.findOne(id);
      }
      catch (err) {
        throw new HTTPError(500, err.message);
      }
    },
    deletePage: (_, { id }) => {
      return Page.deletePage(id);
    },
  },
  Query: {
    page: (_, { id }) => Page.findOne(id),
    pages: async (
      _,
      { input }: { input: { limit?: number; offset?: number; search?: {field:string, value:string}; order?: {field:string, direction:string} } }
    ) => {
      const { limit, offset, search, order } = input ?? {};
      const take = limit ?? 10;
      const skip = offset ?? 0;

      const items = await Page.findAndCount({
        skip,
        take,
        order: order ? {[order.field]:order.direction} : {id:"DESC"},
        where: search ? {[search.field]: ILike(`%${search.value}%`)} : null
      });

      return { items:items[0], nextOffset: items[0].length === take ? skip + take : null, total:items[1] };
    },
    previewPage: async (_, { template }) => {
      return fileRenderer.renderText(template);
    },
  },
};
