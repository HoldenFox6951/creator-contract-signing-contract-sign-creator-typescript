import assert from "node:assert/strict";
import {ContractRequest} from "../src/contract_signer.js";
const parsed = ContractRequest.safeParse({creator:"Mina", subscriber:"Pat", title:"Launch pack", cert_pem:"cert", key_pem:"key"});
assert.equal(parsed.success, true);
assert.equal(ContractRequest.safeParse({creator:"", subscriber:"Pat", title:"x", cert_pem:"c", key_pem:"k"}).success, false);
console.log("contract request validation passed");
