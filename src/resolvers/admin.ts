import { Like } from "typeorm";
import Admin from "../entities/Admin";

export default {
  Mutation: {
    loginAdmin: (_, { email, password }) =>
      Admin.checkCredentials({ email, password }),

    createAdmin: (_, { input }) => {
      return Admin.create(input);
    },
    updateAdmin: (_, { id, input }) => {
      return Admin.update(id, input);
    },
    deleteAdmin: (_, { id }) => {
      return Admin.delete(id).then((r) => r.affected);
    },
  },
  Query: {
    currentAdmin: (_, __, { admin }) => admin,
    admin: (_, { id }) => Admin.findOne(id),
    admins: async (
      _,
      {
        input: { limit, offset, search },
      }: { input: { limit?: number; offset?: number; search?: string } }
    ) => {
      const take = limit ?? 10;
      const skip = offset ?? 0;
      const items = await Admin.find({
        skip,
        take,
        where: {
          email: Like(search + "%"),
        },
        order: {
          id: "DESC",
        },
      });

      return { items, nextOffset: items.length === take ? skip + take : null };
    },
  },
};
