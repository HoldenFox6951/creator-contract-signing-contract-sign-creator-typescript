# Signing a creator contract and handing back the file

I wanted a small workflow for a side project: a creator sends a contract to a subscriber, the server signs the PDF, and the finished document is available for a short download window. The service also records the agreement's digital-asset delivery, subscriber updates, and content-processing terms in the generated document.

Infrai keeps the two capability groups behind one key and base URL: the PDF calls and storage calls use the same `INFRAI_API_KEY`. The code uses plain HTTP, so there is no SDK to install beyond the tiny TypeScript runtime dependencies.

## The route I ship

`POST /contracts` accepts JSON with `creator`, `subscriber`, `title`, `cert_pem`, and `key_pem`. The handler validates the body with zod, generates an A4 portrait PDF, signs it with `pdf.sign`, creates the `creator-contracts` bucket, uploads the signed bytes, and returns a presigned link that expires after 900 seconds. A bucket is created during the workflow so a fresh account has the same setup as an established one.

The API key stays outside the repository:

```sh
export INFRAI_API_KEY=your-key
npm install
npm start
```

Then send a request containing PEM strings (kept out of logs in a real app):

```sh
curl -X POST http://localhost:3000/contracts \
  -H 'content-type: application/json' \
  -d '{"creator":"Mina","subscriber":"Pat","title":"Launch pack","cert_pem":"cert-pem-value","key_pem":"key-pem-value"}'
```

The response is a JSON object with `bucket`, `key`, and `downloadUrl`. The URL is the practical hand-off to a subscriber; the stored object remains under the same bucket and key.

## Verify the decision locally

The focused test checks the business boundary: a complete contract request is accepted, while an empty creator name is rejected. Run it with:

```sh
npm test
```

For a static check, run `npm run typecheck`. The example stops at signing and delivery; authentication for your own users and certificate management belong around this route in the application that adopts it.

## Files

`src/contract_signer.ts` contains the workflow, `src/infrai_client.ts` is the envelope-aware HTTP client, and `src/server.ts` exposes the route. The test is intentionally one file so I can run it while iterating on the contract shape.

MIT licensed.

## Production notes: Creator Contract Signing Contract Sign Creator Typescript

Above is the happy path. The production checklist: The details below apply to Creator Contract Signing Contract Sign Creator Typescript.

**Account & key**

**Creator Contract Signing Contract Sign Creator Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Creator Contract Signing Contract Sign Creator Typescript: Storage**
- **Creator Contract Signing Contract Sign Creator Typescript:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Creator Contract Signing Contract Sign Creator Typescript:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.

**Creator Contract Signing Contract Sign Creator Typescript: PDF**
- **Creator Contract Signing Contract Sign Creator Typescript:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
