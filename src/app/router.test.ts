import { describe, expect, it } from "vitest";
import { parseNovelRoute, parseNovelToolRoute, workspacePath } from "./router";

describe("novel routes", () => {
  it("parses supported deep links", () => {
    expect(parseNovelRoute("/novels/novel-1/knowledge")).toEqual({ novelId: "novel-1", view: "knowledge" });
    expect(parseNovelRoute("/novels/a%2Fb/quality/")).toEqual({ novelId: "a/b", view: "quality" });
  });

  it("rejects unsupported paths", () => {
    expect(parseNovelRoute("/novels/novel-1/settings")).toBeNull();
    expect(parseNovelRoute("/novels/novel-1")).toBeNull();
  });

  it("encodes IDs when building a deep link", () => {
    expect(workspacePath("a/b", "plan")).toBe("/novels/a%2Fb/plan");
  });
  it("parses tool deep links", () => {
    expect(parseNovelToolRoute("/novels/novel-1/tools/benchmarks")).toEqual({ novelId: "novel-1", tool: "benchmarks" });
    expect(parseNovelToolRoute("/novels/novel-1/tools/unknown")).toBeNull();
  });
});
