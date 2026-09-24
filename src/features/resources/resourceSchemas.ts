import { apiOperation, type ApiOperations } from "../../api/client";

export type ResourceKind = "content-types" | "styles" | "creative-templates" | "quality-policies";
export type Resource = { id: string; key: string; name: string; description?: string; status?: string; version?: number; payload?: Record<string, unknown>; [key: string]: unknown };
export type ResourceVersion = Resource & { created_at?: string };
type ListResponse = { items?: Resource[]; resources?: Resource[]; [key: string]: unknown };

const operations = {
  list: "list_resources_api_workspaces__workspace_id___resource_kind__getV1",
  create: "create_resource_api_workspaces__workspace_id___resource_kind__postV1",
  update: "update_resource_api_workspaces__workspace_id___resource_kind___resource_id__patchV1",
  versions: "list_resource_versions_api_workspaces__workspace_id___resource_kind___resource_id__versions_getV1",
  publish: "publish_resource_api_workspaces__workspace_id___resource_kind___resource_id__publish_postV1",
  disable: "disable_resource_api_workspaces__workspace_id___resource_kind___resource_id__disable_postV1",
  copy: "copy_style_resource_api_workspaces__workspace_id__styles__resource_id__copy_postV1",
} as const;

export async function listResources(workspaceId: string, kind: ResourceKind, query?: { status?: string; search?: string }) {
  const response = await apiOperation(operations.list, { parameters: { path: { workspace_id: workspaceId, resource_kind: kind }, query } } as never) as ListResponse;
  return response.items ?? response.resources ?? [];
}
export function createResource(workspaceId: string, kind: ResourceKind, body: { key: string; name: string; description: string; payload?: Record<string, unknown> }) {
  return apiOperation(operations.create, { parameters: { path: { workspace_id: workspaceId, resource_kind: kind } }, body } as never) as Promise<Resource>;
}
export function updateResource(workspaceId: string, kind: ResourceKind, id: string, body: Partial<Resource> & { expected_version?: number }) {
  return apiOperation(operations.update, { parameters: { path: { workspace_id: workspaceId, resource_kind: kind, resource_id: id } }, body } as never) as Promise<Resource>;
}
export function listResourceVersions(workspaceId: string, kind: ResourceKind, id: string) {
  return apiOperation(operations.versions, { parameters: { path: { workspace_id: workspaceId, resource_kind: kind, resource_id: id } } } as never) as Promise<ListResponse>;
}
export function transitionResource(workspaceId: string, kind: ResourceKind, id: string, action: "publish" | "disable", expected_version?: number) {
  const operation = action === "publish" ? operations.publish : operations.disable;
  return apiOperation(operation, { parameters: { path: { workspace_id: workspaceId, resource_kind: kind, resource_id: id } }, body: { expected_version } } as never) as Promise<Resource>;
}
export function copyStyleResource(workspaceId: string, id: string, body: { key: string; name: string; description: string }) {
  return apiOperation(operations.copy, { parameters: { path: { workspace_id: workspaceId, resource_id: id } }, body } as never) as Promise<Resource>;
}
