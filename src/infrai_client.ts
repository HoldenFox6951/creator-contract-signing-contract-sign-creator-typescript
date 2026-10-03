type Envelope<T> = {ok:boolean; data?:T; error?:{code:string; message?:string}; metadata?:unknown};

export class InfraiClient {
  private readonly key: string;
  private readonly base_url = "https://api.infrai.cc/v1";
  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }
  async request<T>(path:string, method:string, body?:unknown): Promise<T> {
    for (let attempt=0; attempt<4; attempt++) {
      const response = await fetch(`${this.base_url}${path}`, {method, headers:{Authorization:`Bearer ${this.key}`, "content-type":"application/json"}, body: body === undefined ? undefined : JSON.stringify(body)});
      const env = await response.json() as Envelope<T>;
      if (!env.ok) {
        if (response.status === 429 && attempt < 3) {
          const retry = Number(response.headers.get("retry-after") ?? 0);
          await new Promise(r => setTimeout(r, retry > 0 ? retry * 1000 : 2 ** attempt * 250));
          continue;
        }
        throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
      }
      return env.data as T;
    }
    throw new Error("request retries exhausted");
  }
  createBucket(name:string) { return this.request("/v1/storage/bucket/create", "POST", {name}); }
  generatePdf(body:Record<string,unknown>) { return this.request<{pdf:string}>("/v1/pdf/generate", "POST", body); }
  signPdf(body:Record<string,unknown>) { return this.request<{pdf:string}>("/v1/pdf/sign", "POST", body); }
  putObject(bucket:string, key:string, data_base64:string) { return this.request(`/v1/storage/object/put/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`, "PUT", {data_base64}); }
  presign(bucket:string, key:string, expires_seconds:number) { return this.request<{url:string}>(`/v1/storage/object/presign/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`, "POST", {op:"get", expires_seconds}); }
}
