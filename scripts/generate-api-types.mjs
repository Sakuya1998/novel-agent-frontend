import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const schemaPath = new URL("../openapi/novel-agent-v1.json", import.meta.url);
const generatedPath = new URL("../src/api/generated/schema.d.ts", import.meta.url);
const operationMapPath = new URL("../src/api/generated/operations.ts", import.meta.url);
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

const operationEntries = [];
for (const [path, methods] of Object.entries(schema.paths ?? {})) {
  for (const [method, operation] of Object.entries(methods ?? {})) {
    if (typeof operation?.operationId !== "string") continue;
    operationEntries.push([operation.operationId, { path, method: method.toUpperCase() }]);
  }
}
operationEntries.sort(([left], [right]) => left.localeCompare(right));
const generatedOperations = `// Generated from openapi/novel-agent-v1.json. Do not edit.\nexport const operationDefinitions = ${JSON.stringify(Object.fromEntries(operationEntries), null, 2)} as const;\n`;

const cliPath = new URL("../node_modules/openapi-typescript/bin/cli.js", import.meta.url);
const args = [fileURLToPath(cliPath), fileURLToPath(schemaPath), "-o", fileURLToPath(generatedPath)];
if (process.argv.includes("--check")) args.push("--check");

const result = spawnSync(process.execPath, args, { cwd: new URL("..", import.meta.url), encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) process.exit(result.status ?? 1);

if (process.argv.includes("--check")) {
  const currentOperations = await readFile(operationMapPath, "utf8");
  if (currentOperations !== generatedOperations)
    throw new Error("Generated operation map is stale; run pnpm run generate:api");
  process.stdout.write(`Validated ${operationEntries.length} API operations and generated types.\n`);
} else {
  await writeFile(operationMapPath, generatedOperations, "utf8");
  process.stdout.write(`Generated OpenAPI types and ${operationEntries.length} operation definitions.\n`);
}
