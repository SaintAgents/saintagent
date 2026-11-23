import React from 'react';
import VaultLibrary from '@/components/vault/VaultLibrary';
import ProjectVaultAttachments from '@/components/vault/ProjectVaultAttachments';
import { canSeeProjectFiles, safeFileUrl } from '@/components/vault/vault';

export default function ProjectVaultDocuments({ project, user }) {
  if (!user) return <p role="status">Loading project documents…</p>;
  const attached = canSeeProjectFiles(project,user);
  const links = [
    ['Business plan',project.business_plan_url], ['Pitch deck',project.pitch_deck_url], ['Screenplay',project.screenplay_url], ['Financial projections',project.financial_projections_url],
    ...(project.other_documents_urls || []).map((url,i)=>[`Supporting document ${i+1}`,url]),
    ...(attached ? (project.attachment_urls || []).map((value,i)=>[value?.name || `Attachment ${i+1}`,value?.url || value]) : []),
  ].filter(([,url])=>safeFileUrl(url));
  const unique = [...new Map(links.map(link=>[link[1],link]).reverse()).values()].reverse();
  return <div className="space-y-5">
    <VaultLibrary key={project.id} {...{project,user}} />
    <section data-readable-surface className="space-y-2 rounded-lg border p-3">
      <h3 className="font-semibold">Project documents</h3>
      {unique.length > 0 ? <ul className="space-y-1">{unique.map(([name,url])=><li key={url}><a className="break-words underline" href={url} target="_blank" rel="noreferrer">View {name}</a></li>)}</ul> : !attached && <p>No project documents are available.</p>}
      {attached && <ProjectVaultAttachments projectId={project.id} />}
    </section>
  </div>;
}