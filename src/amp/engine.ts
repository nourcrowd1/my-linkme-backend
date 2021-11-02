import { Liquid } from "liquidjs";
import path from "path";
import Layout from "../entities/Layout";

const outputDelimiterLeft = "<%";
const outputDelimiterRight = "%>";

export const fileEngine = new Liquid({
  extname: ".liquid",
  outputDelimiterLeft,
  outputDelimiterRight,
  root: [path.resolve(__dirname, "templates")],
});

export const dbEngine = new Liquid({
  outputDelimiterLeft,
  outputDelimiterRight,
  fs: {
    existsSync: undefined,
    readFileSync: undefined,
    resolve: (root, file, ext) => file,
    exists: (filepath) => Layout.count({ id: filepath }).then(Boolean),
    readFile: (filepath) =>
      Layout.findOne(filepath, { select: ["template"] }).then(
        (layout) => layout?.template
      ),
  },
});
