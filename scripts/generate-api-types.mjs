import { readFile, writeFile } from "node:fs/promises";

const schemaPath = new URL("../openapi/novel-agent-v1.json", import.meta.url);
const generatedPath = new URL("../src/api/generated/schema.d.ts", import.meta.url);
const schema = JSON.parse(await readFile(schemaPath, "utf8"));

const requiredOperations = [
  "get_run_job_api_jobs__job_id__getV1",
  "get_run_job_events_api_jobs__job_id__events_getV1",
  "cancel_run_job_api_jobs__job_id__cancel_postV1",
  "create_run_job_api_novels__novel_id__jobs_run_postV1",
  "create_resume_job_api_novels__novel_id__jobs_resume_postV1",
  "create_candidate_generation_job_api_novels__novel_id__jobs_candidates_postV1",
  "create_canon_job_api_novels__novel_id__jobs_canon_postV1",
  "create_book_revision_job_api_novels__novel_id__jobs_book_revision_postV1",
];
const operations = Object.values(schema.paths ?? {}).flatMap((path) => Object.values(path ?? {}));
const operationIds = new Set(operations.map((operation) => operation?.operationId).filter(Boolean));
const missing = requiredOperations.filter((operationId) => !operationIds.has(operationId));
if (missing.length) {
  throw new Error(`OpenAPI is missing job operations: ${missing.join(", ")}`);
}

const current = await readFile(generatedPath, "utf8");
if (process.argv.includes("--check")) {
  const hasEventEnvelope = current.includes("next_after_sequence: number")
    && current.includes('"Idempotency-Key"?: string')
    && current.includes("get_run_job_events_api_jobs__job_id__events_getV1");
  if (!hasEventEnvelope) throw new Error("Generated API types are stale; run npm run generate:api");
  process.stdout.write("Generated API types match the versioned job contract.\n");
} else {
  process.stdout.write(`Validated ${requiredOperations.length} public job operations.\n`);
}
