// backend.ts
import { rpc } from "./backend.rpc";
import { RpcContext } from "rpc-gen";
import express from "express";

const app = express();

app.post("/api/rpc", async (req, res) => {
  const context: RpcContext = {
    name: req.session.name,
  };
  const result = await rpc(context, req.body);
  res.json(result);
});

app.listen(8080);
