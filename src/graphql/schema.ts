import { addSchemaLevelResolver, makeExecutableSchema } from "graphql-tools";
import typeDefs from "../typeDefs";
import resolvers from "../resolvers";
import directiveResolvers from "../directiveResolvers";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
});

export default schema;
