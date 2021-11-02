/**
 * Most of the functions are copied from https://github.com/graphql/express-graphql
 * Several small but crucial things were adjusted:
 * - schema validation is done once - on attaching middleware and not on each request
 * - GraphiQL is removed completely (graphql playground will instead be attached separately)
 */
import schema from "./schema";
import playground from "graphql-playground-middleware-express";
import { URL } from "url";
import {
  validateSchema,
  validate,
  specifiedRules,
  parse,
  Source,
  getOperationAST,
  execute,
  GraphQLError,
} from "graphql";
import { verify } from "jsonwebtoken";
import parseRequest from "./parseRequest";
import { IncomingMessage, ServerResponse } from "http";
import { capitalize } from "../lib";
import { HTTPError } from "../errors";
import { token as tokenConfig } from "../config";
import User from "../entities/User";

/**
 * Helper function for sending a response using only the core Node server APIs.
 */
function sendResponse(
  response: ServerResponse,
  type: string,
  data: string
): void {
  const buff = Buffer.from(data, "utf8");
  response.setHeader("Content-Type", type + "; charset=utf-8");
  response.setHeader("Content-Length", String(buff.length));

  response.end(buff);
}

export default function makeGraphQLMiddleware(
  context: any,
  playgroundOptions: { endpoint: string } = {} as any
) {
  // Assert that schema is required.
  if (schema == null) {
    throw new Error("GraphQL middleware must contain a schema.");
  }

  // Validate Schema
  const schemaValidationErrors = validateSchema(schema);
  if (schemaValidationErrors.length > 0) {
    // Crash server if schema is invalid
    console.error(schemaValidationErrors);
    throw new Error("GraphQL schema validation error.");
  }

  /**
   * Ignore
   * WARNING: You didn't provide an endpoint and don't have a .graphqlconfig.
   */
  const playgroundHTML = playground(playgroundOptions);

  return async (request: IncomingMessage, response: ServerResponse) => {
    // Add CORS Headers
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (["HEAD", "OPTIONS"].includes(request.method)) return response.end();
    const url = new URL(request.url, "http://localhost");
    if (
      process.env.NODE_ENV !== "production" &&
      request.method === "GET" &&
      !url.searchParams.get("query")
    )
      return playgroundHTML(request as any, response as any, () => {});
    let result;
    try {
      const { query, variables, operationName } = await parseRequest(request);
      if (query == null) throw new HTTPError(400, "Must provide query string.");

      // Parse source to AST, reporting any syntax error.
      let documentAST;
      try {
        documentAST = parse(new Source(query, "GraphQL request"));
      } catch (syntaxError) {
        // Return 400: Bad Request if any syntax errors errors exist.
        throw new HTTPError(400, "GraphQL syntax error.", {
          graphqlErrors: [syntaxError],
        });
      }

      // Validate AST, reporting any errors.
      const validationErrors = validate(schema, documentAST, specifiedRules);

      if (validationErrors.length > 0) {
        // Return 400: Bad Request if any validation errors exist.
        throw new HTTPError(400, "GraphQL validation error.", {
          graphqlErrors: validationErrors,
        });
      }

      // Only query operations are allowed on GET requests.
      if (request.method === "GET") {
        // Determine if this GET request will perform a non-query.
        const operationAST = getOperationAST(documentAST, operationName);
        if (operationAST && operationAST.operation !== "query") {
          // Otherwise, report a 405: Method Not Allowed error.
          throw new HTTPError(
            405,
            `Can only perform a ${operationAST.operation} operation from a POST request.`,
            { headers: { Allow: "POST" } }
          );
        }
      }
      const ctx = Object.assign({}, context);

      ctx.token = request.headers.authorization?.replace(/^Bearer\s+/gi, "");
      // Check if its an admin token

      try {
        const { admin, user }: any = await verify(ctx.token, tokenConfig.key, {
          issuer: tokenConfig.issuer,
          audience: tokenConfig.audience,
        });

        if (typeof admin?.id !== "undefined") ctx.admin = admin;
        if (user?.id) ctx.user = await User.findOne(user.id);
      } catch (_) {}

      // Perform the execution, reporting any errors creating the context.
      try {
        result = await execute({
          schema,
          document: documentAST,
          rootValue: undefined,
          contextValue: ctx,
          variableValues: variables,
          operationName,
        });

        if (result?.errors?.length) {
          response.statusCode = 400;
          result.errors = result.errors.map((error) => {
            const originalError = error.originalError;
            if (!originalError) return error;
            if ("statusCode" in originalError) {
              response.statusCode = originalError.statusCode;
            }
            if (originalError.detail) {
              error.message = originalError.detail;
              if (originalError.table && error.message.startsWith("Key")) {
                error.message = error.message.replace(
                  /^Key\s*/,
                  capitalize(originalError.table) + " with "
                );
                response.statusCode = 400;
              }
            }
            if (originalError.field) {
              error.field = originalError.field;
              error.reason = originalError.reason;
            }
            return error;
          });
        }
      } catch (contextError) {
        console.log(contextError);
        // Return 400: Bad Request if any execution context errors exist.
        throw new HTTPError(400, "GraphQL execution context error.", {
          graphqlErrors: [contextError],
        });
      }
    } catch (error) {
      console.log(error);
      // If an error was caught, report the httpError status, or 500.
      response.statusCode = error.statusCode ?? 500;

      const { headers } = error;
      if (headers != null) {
        for (const [key, value] of Object.entries(headers)) {
          response.setHeader(key, String(value));
        }
      }

      result = {
        data: null,
        errors: error.graphqlErrors ?? [error],
      };
    }

    // If no data was included in the result, that indicates a runtime query
    // error, indicate as such with a generic status code.
    // Note: Information about the error itself will still be contained in
    // the resulting JSON payload.
    // https://graphql.github.io/graphql-spec/#sec-Data
    if (response.statusCode === 200 && result.data == null) {
      response.statusCode = 500;
    }

    const payload = JSON.stringify(result, null, 2);
    sendResponse(response, "application/json", payload);
  };
}
