import dotenv from "dotenv";
dotenv.config();

import http from "node:http";
import runApp from "./app";

(async () => {
  const app = await runApp();
  const port = parseInt(process.env.PORT || "5000", 10);

  const server = http.createServer(app);

  server.listen(port, () =>
    console.log(`🚀 API server running on http://localhost:${port}`)
  );
})();
