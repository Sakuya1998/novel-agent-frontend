import { getNovel, getNovelState, listNovels } from "../../api";
import type { Novel } from "../../types";

export function createNovelQueries(workspaceId: string | null) {
  const requireWorkspace = () => {
    if (!workspaceId) throw new Error("尚未选择工作区");
  };
  return {
    list: async (): Promise<Novel[]> => {
      requireWorkspace();
      return listNovels();
    },
    detail: async (novelId: string) => {
      requireWorkspace();
      return getNovel(novelId);
    },
    state: async (novelId: string) => {
      requireWorkspace();
      return getNovelState(novelId);
    },
  };
}
