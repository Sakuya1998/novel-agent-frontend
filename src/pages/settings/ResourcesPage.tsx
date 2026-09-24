import { ArrowLeft } from "lucide-react";
import { ContentTypeManager } from "../../features/resources/ContentTypeManager";
import { StyleLibrary } from "../../features/resources/StyleLibrary";
import { CreativeTemplateManager } from "../../features/resources/CreativeTemplateManager";
import { QualityPolicyManager } from "../../features/resources/QualityPolicyManager";
import type { ResourceKind } from "../../features/resources/resourceSchemas";
export function ResourcesPage({ kind, onBack }: { kind: ResourceKind; onBack: () => void }) {
  const view = {
    "content-types": <ContentTypeManager />,
    styles: <StyleLibrary />,
    "creative-templates": <CreativeTemplateManager />,
    "quality-policies": <QualityPolicyManager />,
  }[kind];
  return (
    <main className="settings-page">
      <header>
        <button className="icon-button" title="返回" aria-label="返回" onClick={onBack}>
          <ArrowLeft size={17} />
        </button>
        <div>
          <span className="eyebrow">RESOURCE LIBRARY</span>
          <h1>资源管理</h1>
        </div>
      </header>
      {view}
    </main>
  );
}
