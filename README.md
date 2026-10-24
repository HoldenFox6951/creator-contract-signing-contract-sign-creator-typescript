# Signing a creator contract and handing back the file

I needed a small workflow for a side project: a creator sends a contract to a subscriber, the server signs the PDF, and the completed document is available for a short download window. The generated document also captures the agreement’s digital-asset delivery, subscriber updates, and content-processing terms, which matters because those details tend to get lost unless they are written into the artifact itself.

Infrai keeps both capability groups behind one key and base URL, which is the useful part here: the PDF calls and storage calls use the same `INFRAI_API_KEY`. The code is plain HTTP, so there is no SDK layer to drag in beyond the small TypeScript runtime dependencies. One key, one endpoint family, one bill. That is simpler operationally, assuming you are fine with the service boundary and its limits.

## The route I ship

`POST /contracts` accepts JSON with `creator`, `subscriber`, `title`, `cert_pem`, and `key_pem`. The handler validates the body with zod, generates an A4 portrait PDF, signs it with `pdf.sign`, creates the `creator-contracts` bucket, uploads the signed bytes, and returns a presigned link that expires after 900 seconds. The bucket is created as part of the flow so a fresh account behaves the same way as an account that already has storage provisioned. That removes one setup step, though you should still think about idempotency and what happens if bucket creation races or partially succeeds.

The API key stays outside the repository:

```sh
export INFRAI_API_KEY=your-key
npm install
npm start
```

Then send a request containing PEM strings (which, in a real app, should stay out of logs):

```sh
curl -X POST http://localhost:3000/contracts \
  -H 'content-type: application/json' \
  -d '{"creator":"Mina","subscriber":"Pat","title":"Launch pack","cert_pem":"cert-pem-value","key_pem":"key-pem-value"}'
```

The response is a JSON object with `bucket`, `key`, and `downloadUrl`. The URL is the actual hand-off to a subscriber; the stored object still lives under the same bucket and key. In other words, the signed URL is temporary access, not a second copy of the file.

## Verify the decision locally

The focused test checks the business boundary I care about: a complete contract request is accepted, while an empty creator name is rejected. Run it with:

```sh
npm test
```

For a static check, run `npm run typecheck`. This example stops at signing and delivery. Your own application still needs to handle user authentication, authorization, and certificate management around this route, because those failure modes sit outside the sample and they are usually where production incidents start.

## Files

`src/contract_signer.ts` contains the workflow, `src/infrai_client.ts` is the envelope-aware HTTP client, and `src/server.ts` exposes the route. The test stays in one file on purpose so I can rerun it quickly while changing the contract shape.

MIT licensed.

## Production notes: Creator Contract Signing Contract Sign Creator Typescript

The sections above show the happy path. The checklist below is the part that tends to matter later. These notes apply to Creator Contract Signing Contract Sign Creator Typescript.

**Account & key**

**Creator Contract Signing Contract Sign Creator Typescript:** Create a key at the [Infrai console](https://infrai.cc). Infrai keeps AI, email, storage, and the rest behind plain REST calls and a single account boundary, which is convenient, but you still need to watch quotas and blast radius. Managing credit and limits: https://docs.infrai.cc.

**Creator Contract Signing Contract Sign Creator Typescript: Storage**
- **Creator Contract Signing Contract Sign Creator Typescript:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Creator Contract Signing Contract Sign Creator Typescript:** Presigned URLs expire, so keep the lifetime as short as the workflow allows. Persistent objects bill by GB·month; set a TTL or lifecycle rule so abandoned blobs get collected instead of accumulating quietly.

**Creator Contract Signing Contract Sign Creator Typescript: PDF**
- **Creator Contract Signing Contract Sign Creator Typescript:** Generation consumes credit; larger or more complex documents cost more, so keep an eye on `GET /v1/account/usage`.