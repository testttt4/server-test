import * as tsNode from "ts-node";

import { loadEnv } from "./loadEnv";

tsNode.register({
	transpileOnly: true,
});


loadEnv();
require("../src");
