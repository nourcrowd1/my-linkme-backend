import { Connection } from "typeorm";
import { GraphQLJSON, DateResolver } from "graphql-scalars";

export default {
  Query: {
    health: (_, __, { connection }: { connection: Connection }) => {
      return connection.isConnected;
    },
  },
  JSON: GraphQLJSON,
  Date: DateResolver,
};
