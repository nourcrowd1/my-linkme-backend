import zlib, { Inflate, Gunzip } from "zlib";
import querystring from "querystring";
import getBody from "raw-body";
import { URLSearchParams } from "url";
import contentType, { ParsedMediaType } from "content-type";
import { IncomingMessage } from "http";
import { HTTPError } from "../errors";

export interface GraphQLParams {
  query: string | null;
  variables: { readonly [name: string]: unknown } | null;
  operationName: string | null;
  raw: boolean;
}

// Return a decompressed stream, given an encoding.
function decompressed(
  req: IncomingMessage,
  encoding: string
): IncomingMessage | Inflate | Gunzip {
  switch (encoding) {
    case "identity":
      return req;
    case "deflate":
      return req.pipe(zlib.createInflate());
    case "gzip":
      return req.pipe(zlib.createGunzip());
  }
  throw new HTTPError(415, `Unsupported content-encoding "${encoding}".`);
}

/**
 * RegExp to match an Object-opening brace "{" as the first non-space
 * in a string. Allowed whitespace is defined in RFC 7159:
 *
 *     ' '   Space
 *     '\t'  Horizontal tab
 *     '\n'  Line feed or New line
 *     '\r'  Carriage return
 */
const jsonObjRegex = /^[ \t\n\r]*\{/;

// Read and parse a request body.
async function readBody(
  req: IncomingMessage,
  typeInfo: ParsedMediaType
): Promise<string> {
  const charset = typeInfo.parameters.charset?.toLowerCase() ?? "utf-8";

  // Assert charset encoding per JSON RFC 7159 sec 8.1
  if (charset.slice(0, 4) !== "utf-") {
    throw new HTTPError(415, `Unsupported charset "${charset.toUpperCase()}".`);
  }

  // Get content-encoding (e.g. gzip)
  const contentEncoding = req.headers["content-encoding"];
  const encoding =
    typeof contentEncoding === "string"
      ? contentEncoding.toLowerCase()
      : "identity";
  const length = encoding === "identity" ? req.headers["content-length"] : null;
  const limit = 1024 * 1024; // 1MB
  const stream = decompressed(req, encoding);

  // Read body from stream.
  try {
    return await getBody(stream, { encoding: charset, length, limit });
  } catch (err) {
    throw err.type === "encoding.unsupported"
      ? new HTTPError(415, `Unsupported charset "${charset.toUpperCase()}".`)
      : new HTTPError(400, `Invalid body: ${String(err.message)}.`);
  }
}

export async function parseBody(
  req: IncomingMessage
): Promise<{ [param: string]: unknown }> {
  const { body } = req as any;

  // If server has already parsed a body as a keyed object, use it.
  if (typeof body === "object" && !(body instanceof Buffer)) {
    return body as { [param: string]: unknown };
  }

  // Skip requests without content types.
  if (req.headers["content-type"] === undefined) {
    return {};
  }

  const typeInfo = contentType.parse(req);

  // If server has already parsed a body as a string, and the content-type
  // was application/graphql, parse the string body.
  if (typeof body === "string" && typeInfo.type === "application/graphql") {
    return { query: body };
  }

  // Already parsed body we didn't recognise? Parse nothing.
  if (body != null) {
    return {};
  }

  const rawBody = await readBody(req, typeInfo);
  // Use the correct body parser based on Content-Type header.
  switch (typeInfo.type) {
    case "application/graphql":
      return { query: rawBody };
    case "application/json":
      if (jsonObjRegex.test(rawBody)) {
        try {
          return JSON.parse(rawBody);
        } catch (error) {
          // Do nothing
        }
      }
      throw new HTTPError(400, "POST body sent invalid JSON.");
    case "application/x-www-form-urlencoded":
      return querystring.parse(rawBody);
  }

  // If no Content-Type header matches, parse nothing.
  return {};
}
/**
 * Provided a "Request" provided by server or connect (typically a node style
 * HTTPClientRequest), Promise the GraphQL request parameters.
 */
export default async function parseRequest(
  request: IncomingMessage
): Promise<GraphQLParams> {
  const urlData = new URLSearchParams(request.url.split("?")[1]);
  const bodyData = await parseBody(request);

  // GraphQL Query string.
  let query = urlData.get("query") ?? (bodyData.query as string | null);
  if (typeof query !== "string") {
    query = null;
  }

  // Parse the variables if needed.
  let variables = (urlData.get("variables") ?? bodyData.variables) as {
    readonly [name: string]: unknown;
  } | null;
  if (typeof variables === "string") {
    try {
      variables = JSON.parse(variables);
    } catch (error) {
      throw new HTTPError(400, "Variables are invalid JSON.");
    }
  } else if (typeof variables !== "object") {
    variables = null;
  }

  // Name of GraphQL operation to execute.
  let operationName =
    urlData.get("operationName") ?? (bodyData.operationName as string | null);
  if (typeof operationName !== "string") {
    operationName = null;
  }

  const raw = urlData.get("raw") != null || bodyData.raw !== undefined;

  return { query, variables, operationName, raw };
}
