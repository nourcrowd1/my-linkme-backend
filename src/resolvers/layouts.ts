import { Like } from "typeorm";
import Layout from "../entities/Layout";

export default {
  Mutation: {
    createLayout: (_, { input }) => {
      return Layout.create(input);
    },
    updateLayout: (_, { id, input }) => {
      return Layout.update(id, input);
    },
    deleteLayout: (_, { id }) => {
      return Layout.delete(id).then((r) => r.affected);
    },
  },
  Query: {
    layout: (_, { id }) => Layout.findOne(id),
    layouts: async (
      _,
      { input }: { input: { limit?: number; offset?: number; search?: string } }
    ) => {
      const { limit, offset, search } = input ?? {};
      const take = limit ?? 10;
      const skip = offset ?? 0;
      const items = await Layout.find({
        skip,
        take,
        where: search && {
          id: Like(search + "%"),
        },
        order: {
          id: "ASC",
        },
      });

      return { items, nextOffset: items.length === take ? skip + take : null };
    },
  },
};
