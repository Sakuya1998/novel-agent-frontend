/** Generated request/response types derived from openapi/novel-agent-v1.json. */
export interface paths {
  "/api/v1/jobs/{job_id}": {
    get: operations["get_run_job_api_jobs__job_id__getV1"];
  };
  "/api/v1/jobs/{job_id}/events": {
    get: operations["get_run_job_events_api_jobs__job_id__events_getV1"];
  };
  "/api/v1/jobs/{job_id}/cancel": {
    post: operations["cancel_run_job_api_jobs__job_id__cancel_postV1"];
  };
  "/api/v1/novels/{novel_id}/jobs/run": {
    post: operations["create_run_job_api_novels__novel_id__jobs_run_postV1"];
  };
  "/api/v1/novels/{novel_id}/jobs/resume": {
    post: operations["create_resume_job_api_novels__novel_id__jobs_resume_postV1"];
  };
  "/api/v1/novels/{novel_id}/jobs/candidates": {
    post: operations["create_candidate_generation_job_api_novels__novel_id__jobs_candidates_postV1"];
  };
  "/api/v1/novels/{novel_id}/jobs/canon": {
    post: operations["create_canon_job_api_novels__novel_id__jobs_canon_postV1"];
  };
  "/api/v1/novels/{novel_id}/jobs/book-revision": {
    post: operations["create_book_revision_job_api_novels__novel_id__jobs_book_revision_postV1"];
  };
}

export interface components {
  schemas: {
    BookRevisionRequest: {
      chapter_number: number;
      feedback: string;
    };
    CandidateGenerationRequest: {
      count?: number;
      instruction?: string;
    };
    CanonOperationRequest: {
      action: string;
      reason: string;
      [key: string]: unknown;
    };
    ResumeRequest: {
      feedback?: string;
      scene_number?: number | null;
      version_number?: number | null;
      candidate_id?: string | null;
      review_type?: string | null;
      world_bible?: string | null;
      characters?: Record<string, unknown>[] | null;
      outline?: Record<string, unknown>[] | null;
      scene_plan?: Record<string, unknown>[] | null;
    };
  };
}

export interface operations {
  get_run_job_api_jobs__job_id__getV1: {
    parameters: { path: { job_id: string } };
    responses: { 200: { content: { "application/json": Record<string, unknown> } } };
  };
  get_run_job_events_api_jobs__job_id__events_getV1: {
    parameters: {
      path: { job_id: string };
      query?: { after_sequence?: number; limit?: number };
    };
    responses: { 200: { content: { "application/json": {
      job: Record<string, unknown>;
      events: Array<{
        job_id: string;
        sequence: number;
        type: string;
        payload: Record<string, unknown>;
        created_at: string;
      }>;
      next_after_sequence: number;
    } } } };
  };
  cancel_run_job_api_jobs__job_id__cancel_postV1: {
    parameters: { path: { job_id: string }; header?: { "Idempotency-Key"?: string } };
    responses: { 200: { content: { "application/json": Record<string, unknown> } } };
  };
  create_run_job_api_novels__novel_id__jobs_run_postV1: NovelJobOperation;
  create_resume_job_api_novels__novel_id__jobs_resume_postV1: NovelJobOperation<components["schemas"]["ResumeRequest"]>;
  create_candidate_generation_job_api_novels__novel_id__jobs_candidates_postV1: NovelJobOperation<components["schemas"]["CandidateGenerationRequest"]>;
  create_canon_job_api_novels__novel_id__jobs_canon_postV1: NovelJobOperation<components["schemas"]["CanonOperationRequest"]>;
  create_book_revision_job_api_novels__novel_id__jobs_book_revision_postV1: NovelJobOperation<components["schemas"]["BookRevisionRequest"]>;
}

interface NovelJobOperation<Body = never> {
  parameters: { path: { novel_id: string }; header?: { "Idempotency-Key"?: string } };
  requestBody: [Body] extends [never] ? never : { content: { "application/json": Body } };
  responses: { 202: { content: { "application/json": Record<string, unknown> } } };
}
