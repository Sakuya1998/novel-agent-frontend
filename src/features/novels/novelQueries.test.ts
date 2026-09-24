import { describe, expect, it, vi } from "vitest";

const listNovels = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock("../../api", () => ({ listNovels, getNovel: vi.fn(), getNovelState: vi.fn() }));
import { createNovelQueries } from "./novelQueries";

describe("novelQueries", () => {
  it("requires a selected workspace before querying", async () => {
    await expect(createNovelQueries(null).list()).rejects.toThrow("尚未选择工作区");
  });
  it("passes through queries for the selected workspace", async () => {
    await createNovelQueries("workspace-1").list();
    expect(listNovels).toHaveBeenCalledOnce();
  });
});
