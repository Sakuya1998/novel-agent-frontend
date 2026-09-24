import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResourceManager } from "./ResourceManager";

vi.mock("../../auth/SessionProvider", () => ({ useSession: () => ({ user: { role: "viewer" } }) }));
vi.mock("../../workspaces/WorkspaceProvider", () => ({ useWorkspace: () => ({ workspace: { id: "w1" } }) }));
vi.mock("./resourceSchemas", () => ({
  listResources: vi.fn().mockResolvedValue([{ id: "r1", key: "novel", name: "小说", status: "published", version: 2 }]),
  listResourceVersions: vi.fn().mockResolvedValue({ items: [] }),
}));

describe("ResourceManager", () => {
  it("shows resources and hides write controls for viewers", async () => {
    render(<ResourceManager kind="content-types" />);
    expect(await screen.findByText("小说")).toBeTruthy();
    expect(screen.queryByText("新建")).toBeNull();
  });
});
