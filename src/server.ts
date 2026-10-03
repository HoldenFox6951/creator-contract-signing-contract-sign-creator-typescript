import {createServer} from "node:http";
import {InfraiClient} from "./infrai_client.js";
import {ContractRequest, signAndStore} from "./contract_signer.js";
const client = new InfraiClient();
createServer(async (req,res) => {
  if (req.method !== "POST" || req.url !== "/contracts") { res.writeHead(404); res.end(); return; }
  try {
    const chunks:Buffer[]=[]; for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const input = ContractRequest.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    const result = await signAndStore(input, client);
    res.writeHead(201,{"content-type":"application/json"}); res.end(JSON.stringify(result));
  } catch (error) { res.writeHead(400,{"content-type":"application/json"}); res.end(JSON.stringify({error:error instanceof Error ? error.message : "invalid request"})); }
}).listen(Number(process.env.PORT ?? 3000));
