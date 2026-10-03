import {z} from "zod";
import {InfraiClient} from "./infrai_client.js";

export const ContractRequest = z.object({creator:z.string().min(1), subscriber:z.string().min(1), title:z.string().min(1), cert_pem:z.string().min(1), key_pem:z.string().min(1)});
export type ContractInput = z.infer<typeof ContractRequest>;
export async function signAndStore(input:ContractInput, client:InfraiClient) {
  const value = ContractRequest.parse(input);
  const generated = await client.generatePdf({markdown:`# ${value.title}\n\nCreator: ${value.creator}\nSubscriber: ${value.subscriber}\n\nThis agreement covers digital-asset delivery, subscriber updates, and content processing.`, page_size:"A4", orientation:"portrait", store:false});
  const signed = await client.signPdf({pdf:generated.pdf, cert_pem:value.cert_pem, key_pem:value.key_pem, reason:"Creator commerce agreement"});
  const bucket = "creator-contracts";
  const objectKey = `${value.creator.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${Date.now()}.pdf`;
  await client.createBucket(bucket);
  await client.putObject(bucket, objectKey, signed.pdf);
  const link = await client.presign(bucket, objectKey, 900);
  return {bucket, key:objectKey, downloadUrl:link.url};
}
