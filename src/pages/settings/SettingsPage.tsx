import { ArrowLeft, Settings, ShieldCheck, Download } from "lucide-react";
import { ModelSettingsDialog } from "../../components/ModelSettingsDialog";
import { MonitoringDialog } from "../../components/MonitoringDialog";
import { ImportExportDialog } from "../../components/ImportExportDialog";
import { useWorkbench } from "../../useWorkbench";

export type SettingsSection = "models" | "resources" | "audit";

export function SettingsPage({ section, onBack }: { section: SettingsSection; onBack: () => void }) {
  const workbench = useWorkbench(true);
  const content = {
    models: { title: "模型设置", description: "模型档案与路由配置将在此处管理。", icon: Settings },
    resources: { title: "导入与导出", description: "迁移作品、生成归档并查看传输状态。", icon: Download },
    audit: { title: "运行与审计", description: "服务状态、任务记录和审计日志。", icon: ShieldCheck },
  }[section];
  const Icon = content.icon;
  return <main className="settings-page"><header><button className="icon-button" title="返回工作台" aria-label="返回工作台" onClick={onBack}><ArrowLeft size={17} /></button><div><span className="eyebrow">SETTINGS</span><h1><Icon size={22} />{content.title}</h1></div></header><section className="settings-placeholder"><h2>{content.title}</h2><p>{content.description}</p><span>页面入口已就绪，具体操作将在对应资源页完成。</span></section>{section === "models" ? <ModelSettingsDialog open isStreaming={workbench.isStreaming} onClose={onBack} /> : null}{section === "audit" ? <MonitoringDialog open onClose={onBack} /> : null}{section === "resources" ? <ImportExportDialog open novelTitle={workbench.novel?.title ?? ""} onClose={onBack} onExport={workbench.exportNovel} onImport={workbench.importNovel} /> : null}</main>;
}
