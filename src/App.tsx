import { AlertCircle, GitBranch } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "./auth/SessionProvider";
import { AuthDialog } from "./components/AuthDialog";
import { BookAuditPanel } from "./components/BookAuditPanel";
import { CanonDialog } from "./components/CanonDialog";
import { CreativeBriefDialog } from "./components/CreativeBriefDialog";
import { EmptyWorkspace } from "./components/EmptyWorkspace";
import { EvaluationBenchmarkDialog } from "./components/EvaluationBenchmarkDialog";
import { ImportExportDialog } from "./components/ImportExportDialog";
import { KnowledgeWorkspace } from "./features/novels/KnowledgeWorkspace";
import { MemoryQualityDialog } from "./components/MemoryQualityDialog";
import { ModelSettingsDialog } from "./components/ModelSettingsDialog";
import { ModelTraceDialog } from "./components/ModelTraceDialog";
import { MonitoringDialog } from "./components/MonitoringDialog";
import { NovelSidebar } from "./components/NovelSidebar";
import { PlanningReviewPanel } from "./components/PlanningReviewPanel";
import { PlanningWorkspace } from "./features/novels/PlanningWorkspace";
import { ProjectOverview } from "./components/ProjectOverview";
import { QualityWorkspace } from "./features/novels/QualityWorkspace";
import { WritingWorkspace, type WritingReaderFocus } from "./features/novels/WritingWorkspace";
import { StageRail } from "./components/StageRail";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { WorkspaceNav, type WorkspaceView } from "./components/WorkspaceNav";
import { useServiceStatus } from "./useServiceStatus";
import { useWorkbench } from "./useWorkbench";
import { useReviewWorkflow } from "./features/novels/useReviewWorkflow";
import { workspacePath } from "./app/router";
import { isReadOnly } from "./permissions/permissions";
import type { CanonOperation } from "./types";
import "./book-audit.css";

type DialogName =
  "settings" | "canon" | "brief" | "traces" | "benchmarks" | "auth" | "memory" | "transfer" | "monitoring";

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    blueprint_review: "等待蓝图审阅",
    scene_review: "等待分镜审阅",
    human_review: "等待人工审查",
    completed: "创作完成",
    running: "创作进行中",
    interrupted: "运行已中断",
    error: "运行失败",
    legacy_read_only: "只读作品",
    idle: "准备开始",
  };
  return labels[status ?? ""] ?? "尚未启动";
}

function errorCopy(error: string) {
  if (/请求失败 \(50[234]\)|failed to fetch|networkerror/i.test(error)) return "无法连接后端服务，请确认服务已经启动。";
  return error;
}

interface AppProps {
  initialNovelId?: string;
  initialView?: WorkspaceView;
  initialDialog?: DialogName;
}

function App({ initialNovelId, initialView, initialDialog }: AppProps) {
  const session = useSession();
  const authEnabled = session.status === "loading" ? undefined : session.enabled;
  const authUser = session.user;
  const readOnly = authEnabled === true && isReadOnly(authUser?.role);
  const workbench = useWorkbench(authEnabled === false || (authEnabled === true && authUser !== null));
  const serviceStatus = useServiceStatus();
  const [activeDialog, setActiveDialog] = useState<DialogName | undefined>(initialDialog);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>(initialView ?? "write");
  const [readerFocus, setReaderFocus] = useState<WritingReaderFocus>();
  const [createOpen, setCreateOpen] = useState(false);
  const { novel, state, error, isStreaming, lastNode } = workbench;
  useEffect(() => {
    if (
      initialNovelId &&
      workbench.novels.some((item) => item.id === initialNovelId) &&
      workbench.selectedId !== initialNovelId
    ) {
      workbench.setSelectedId(initialNovelId);
    }
  }, [initialNovelId, workbench.novels, workbench.selectedId]);
  useEffect(() => {
    if (initialView) setWorkspaceView(initialView);
  }, [initialView]);
  useEffect(() => {
    if (initialDialog === "benchmarks") void workbench.loadEvaluationBenchmarks();
    if (initialDialog === "traces") void workbench.loadModelTraces();
    if (initialDialog === "memory") void workbench.loadMemoryQuality();
  }, [initialDialog, workbench.loadEvaluationBenchmarks, workbench.loadMemoryQuality, workbench.loadModelTraces]);
  useEffect(() => {
    if (!workbench.selectedId || initialDialog) return;
    const target = workspacePath(workbench.selectedId, workspaceView);
    if (window.location.pathname !== target) window.history.replaceState({}, "", target);
  }, [initialDialog, workbench.selectedId, workspaceView]);
  const reviewWorkflow = useReviewWorkflow({
    novelId: workbench.selectedId ?? "",
    chapterNumber: state?.current_draft.chapter_number ?? 0,
    onSubmit: workbench.resume,
  });
  const { runAction } = reviewWorkflow;
  const { updateCanon } = workbench;
  const applyCanon = useCallback(
    (operation: CanonOperation) => runAction("canon", () => updateCanon(operation), undefined, true),
    [runAction, updateCanon],
  );
  const creativeBrief = novel?.creative_brief ?? state?.creative_brief;
  const planningReview = state?.status === "blueprint_review" || state?.status === "scene_review";

  useEffect(() => {
    if (authEnabled === true && (error.includes("需要登录") || error.includes("会话无效"))) setActiveDialog("auth");
  }, [authEnabled, error]);

  useEffect(() => {
    if (initialView === undefined) setWorkspaceView(planningReview ? "plan" : "write");
  }, [workbench.selectedId, planningReview, initialView]);

  function changeWorkspaceView(view: WorkspaceView) {
    setWorkspaceView(view);
    if (workbench.selectedId) {
      const target = workspacePath(workbench.selectedId, view);
      window.history.pushState({}, "", target);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  function selectNovel(id: string) {
    workbench.setSelectedId(id);
    window.history.pushState({}, "", workspacePath(id, workspaceView));
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function openBenchmarks() {
    if (workbench.selectedId) {
      setActiveDialog("benchmarks");
      window.history.pushState({}, "", `/novels/${encodeURIComponent(workbench.selectedId)}/tools/benchmarks`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    setActiveDialog("benchmarks");
    void workbench.loadEvaluationBenchmarks();
  }

  function openSettingsPage(section: "models" | "resources" | "audit") {
    window.history.pushState({}, "", `/settings/${section}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function openTraces() {
    if (workbench.selectedId) {
      setActiveDialog("traces");
      window.history.pushState({}, "", `/novels/${encodeURIComponent(workbench.selectedId)}/tools/traces`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    setActiveDialog("traces");
    void workbench.loadModelTraces();
  }
  function openNovelTool(tool: "brief" | "canon" | "memory") {
    setActiveDialog(tool);
    if (!workbench.selectedId) return;
    window.history.pushState({}, "", `/novels/${encodeURIComponent(workbench.selectedId)}/tools/${tool}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  function closeDialog() {
    setActiveDialog(undefined);
    if (initialDialog && workbench.selectedId) {
      window.history.pushState({}, "", workspacePath(workbench.selectedId, workspaceView));
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  return (
    <div className="app-shell">
      <NovelSidebar
        novels={workbench.novels}
        selectedId={workbench.selectedId}
        isLoading={workbench.isLoading}
        isStreaming={isStreaming}
        deletingId={workbench.deletingId}
        serviceStatus={serviceStatus}
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
        onSelect={selectNovel}
        onCreate={workbench.addNovel}
        onDelete={(item) => workbench.removeNovel(item.id)}
      />
      <main className="workspace">
        <WorkspaceHeader
          projectTitle={novel?.title}
          serviceStatus={serviceStatus}
          authEnabled={authEnabled}
          authUser={authUser}
          onOpenAuth={() => setActiveDialog("auth")}
          onOpenMonitoring={() => openSettingsPage("audit")}
          onOpenBenchmarks={openBenchmarks}
          onOpenImportExport={() => openSettingsPage("resources")}
          onOpenTraces={openTraces}
          onOpenSettings={() => openSettingsPage("models")}
          onRefresh={workbench.selectedId ? () => window.location.reload() : undefined}
        />
        {error ? (
          <div className="global-error" role="alert" aria-live="assertive">
            <AlertCircle size={16} />
            <span>{errorCopy(error)}</span>
            <button type="button" onClick={() => window.location.reload()}>
              重试
            </button>
          </div>
        ) : null}

        {!novel || !state ? (
          <EmptyWorkspace
            serviceStatus={serviceStatus}
            onCreate={() => setCreateOpen(true)}
            onImport={() => setActiveDialog("transfer")}
            onSettings={() => setActiveDialog("settings")}
          />
        ) : (
          <>
            <ProjectOverview novel={novel} state={state} statusLabel={statusLabel(state.status)} />
            <StageRail lastNode={lastNode} status={state.status} currentPhase={state.current_phase} />
            <WorkspaceNav
              active={workspaceView}
              status={state.status}
              issueCount={state.conflicts?.length || state.issues.length}
              onChange={changeWorkspaceView}
            />

            {state.replan_proposal?.status === "replanned" ? (
              <div className="replan-callout" role="status">
                <GitBranch size={16} />
                <div>
                  <strong>后续大纲已调整</strong>
                  <span>{state.replan_proposal.rationale || "系统根据最新定稿更新了未来章节。"}</span>
                </div>
              </div>
            ) : null}
            {state.replan_proposal?.status === "error" ? (
              <div className="replan-callout warning" role="status">
                <AlertCircle size={16} />
                <div>
                  <strong>后续大纲保持不变</strong>
                  <span>{state.replan_proposal.rationale || "重规划未应用，当前大纲继续有效。"}</span>
                </div>
              </div>
            ) : null}

            {workspaceView === "plan" ? (
              planningReview ? (
                <PlanningReviewPanel
                  reviewScope={`${novel.id}:${state.status}:${state.current_chapter}`}
                  reviewNode={state.status as "blueprint_review" | "scene_review"}
                  worldBible={state.world_bible ?? ""}
                  characters={state.characters ?? []}
                  outline={state.outline ?? []}
                  scenePlan={state.scene_plan ?? []}
                  planningVersions={state.planning_versions ?? []}
                  disabled={isStreaming || readOnly}
                  onSubmit={workbench.resume}
                  onLoadVersion={workbench.loadPlanningVersion}
                  onCompareVersions={workbench.comparePlanningVersions}
                />
              ) : (
                <PlanningWorkspace state={state} />
              )
            ) : null}

            {workspaceView === "knowledge" ? (
              <KnowledgeWorkspace
                novel={novel}
                state={state}
                onOpenBrief={() => !readOnly && openNovelTool("brief")}
                onOpenCanon={() => !readOnly && openNovelTool("canon")}
                onOpenMemory={() => openNovelTool("memory")}
              />
            ) : null}

            {workspaceView === "quality" ? (
              state.status === "completed" && state.book_audit ? (
                <div className="workspace-book-audit">
                  <BookAuditPanel
                    report={state.book_audit}
                    totalChapters={state.total_chapters}
                    disabled={isStreaming || readOnly}
                    onStartRevision={readOnly ? async () => undefined : workbench.startBookRevision}
                  />
                </div>
              ) : (
                <QualityWorkspace
                  state={state}
                  onOpenMonitoring={() => setActiveDialog("monitoring")}
                  onOpenBenchmarks={openBenchmarks}
                  onOpenTraces={openTraces}
                />
              )
            ) : null}

            {workspaceView === "write" ? (
              <WritingWorkspace
                novel={novel}
                state={state}
                readerFocus={readerFocus}
                onReaderFocusChange={setReaderFocus}
                connectionStatus={workbench.connectionStatus}
                lastNode={lastNode}
                isStreaming={isStreaming}
                onRun={readOnly ? async () => undefined : workbench.run}
                onCancel={workbench.cancelJob}
                onRetry={workbench.retryRunConnection}
                reviewWorkflow={reviewWorkflow}
                onApplyCanon={readOnly ? async () => undefined : workbench.updateCanon}
                onGenerateCandidates={readOnly ? async () => undefined : workbench.generateCandidates}
                onCompareVersions={workbench.compareVersions}
                onEvaluateVersion={workbench.evaluateVersion}
                onSetEvaluationBaseline={workbench.setEvaluationBaseline}
                onCompareEvaluations={workbench.compareEvaluations}
                onOpenPlanning={() => changeWorkspaceView("plan")}
                onOpenQuality={() => changeWorkspaceView("quality")}
              />
            ) : null}
          </>
        )}
      </main>

      <CanonDialog
        open={activeDialog === "canon"}
        embedded={initialDialog === "canon"}
        novelId={workbench.selectedId}
        editable={state?.status === "human_review"}
        disabled={isStreaming || Boolean(reviewWorkflow.busyAction)}
        currentChapter={state?.current_chapter}
        scenePlan={state?.current_draft.scene_plan}
        onClose={closeDialog}
        onSubmit={applyCanon}
      />
      <CreativeBriefDialog
        open={activeDialog === "brief"}
        embedded={initialDialog === "brief"}
        brief={creativeBrief}
        version={novel?.creative_brief_version ?? state?.creative_brief_version}
        versions={workbench.creativeBriefVersions}
        disabled={isStreaming}
        onClose={closeDialog}
        onSubmit={workbench.updateBrief}
      />
      <ModelTraceDialog
        open={activeDialog === "traces"}
        embedded={initialDialog === "traces"}
        traces={workbench.modelTraces}
        onRefresh={workbench.loadModelTraces}
        onClose={closeDialog}
      />
      <EvaluationBenchmarkDialog
        open={activeDialog === "benchmarks"}
        embedded={initialDialog === "benchmarks"}
        runs={workbench.evaluationBenchmarks}
        onRun={workbench.runBenchmark}
        onClose={closeDialog}
      />
      <MemoryQualityDialog
        open={activeDialog === "memory"}
        embedded={initialDialog === "memory"}
        history={workbench.memoryQuality}
        onRefresh={workbench.loadMemoryQuality}
        onEvaluate={workbench.runMemoryQuality}
        onRebuild={workbench.rebuildMemoryIndex}
        onClose={closeDialog}
      />
      <ImportExportDialog
        open={activeDialog === "transfer"}
        novelTitle={novel?.title ?? ""}
        onClose={() => setActiveDialog(undefined)}
        onExport={workbench.exportNovel}
        onImport={workbench.importNovel}
      />
      <AuthDialog
        open={authEnabled === true && activeDialog === "auth"}
        currentUser={authUser}
        onLogin={async (identifier, password) => {
          const result = await session.login(identifier, password);
          setActiveDialog(undefined);
          return result;
        }}
        onRegister={async (payload) => {
          const result = await session.register(payload);
          setActiveDialog(undefined);
          return result;
        }}
        onLogout={async () => {
          await session.logout();
          setActiveDialog(undefined);
        }}
        onClose={() => setActiveDialog(undefined)}
      />
      <MonitoringDialog open={activeDialog === "monitoring"} onClose={() => setActiveDialog(undefined)} />
      <ModelSettingsDialog
        open={activeDialog === "settings"}
        isStreaming={isStreaming}
        onClose={() => setActiveDialog(undefined)}
      />
    </div>
  );
}

export default App;
