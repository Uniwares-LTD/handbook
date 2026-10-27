import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ghJson, graph } from './enroll.mjs';
import { loadTracking, validateTracking } from './tracking-config.mjs';
import { projectState } from './project-management.mjs';

// Evidence is an explicit attestation of the human decision, not inferred token identity.
export function closureDecision(issue, events, evidence) {
  if (issue.state !== 'closed' || issue.pull_request) return { eligible: false, reason: 'Issue is open/reopened or is a pull request.' };
  const last = events.filter(e => ['closed', 'reopened'].includes(e.event)).at(-1);
  if (!last || last.event !== 'closed' || last.actor?.type !== 'User' || last.commit_id || last.created_at !== issue.closed_at) return { eligible: false, reason: 'Latest human closure evidence is absent, automated or ambiguous.' };
  if (!evidence || evidence.eventId !== last.id || evidence.actor !== last.actor.login || !evidence.decisionReference?.trim()) return { eligible: false, reason: 'Supply the verified human decision reference, actor and latest closure event ID; credentials alone are not evidence.' };
  const status = issue.state_reason === 'completed' ? 'Done' : issue.state_reason === 'not_planned' ? 'Cancelled' : null;
  return status ? { eligible: true, status, eventId: last.id, actor: last.actor.login, decisionReference: evidence.decisionReference } : { eligible: false, reason: 'Unknown closure reason; preserve status.' };
}
export function reconcileStatus(config, { references = [], evidence = {}, apply = false, api = ghJson } = {}) {
  validateTracking(config);
  if (!config.number) throw new Error('Select an existing project first.');
  const id = graph(api, `query($owner:String!){organization(login:$owner){projectV2(number:${config.number}){id}}}`, { owner: config.organization }).organization?.projectV2?.id;
  if (!id || (config.id && id !== config.id)) throw new Error('Project identity unavailable or changed.');
  const state = projectState(id, api);
  if (state.owner.login !== config.organization || state.limitations.length) throw new Error('Incomplete project inventory or wrong organization.');
  const fields = state.fields.filter(f => f.name === (config.fieldNames?.status ?? 'Status'));
  if (fields.length !== 1 || fields[0].dataType !== 'SINGLE_SELECT') throw new Error('Status mapping is missing or ambiguous.');
  const field = fields[0];
  const inspect = ref => {
    const match = ref.match(/^([^#]+)#([1-9]\d*)$/);
    if (!match || !config.repositories.includes(match[1])) throw new Error(`Issue is outside selected repositories: ${ref}`);
    const issue = api(['api', `repos/${match[1]}/issues/${match[2]}`]);
    const pages = api(['api', '--paginate', '--slurp', `repos/${match[1]}/issues/${match[2]}/events?per_page=100`]);
    if (!Array.isArray(pages) || !pages.every(Array.isArray)) throw new Error('Incomplete closure history.');
    const decision = closureDecision(issue, pages.flat(), evidence[ref]);
    const item = state.items.find(i => i.content?.id === issue.node_id);
    if (!item) return { reference: ref, eligible: false, reason: 'Issue is not in the selected project.' };
    const option = field.options.find(o => o.name === (config.statuses?.[decision.status] ?? decision.status));
    if (decision.eligible && !option) throw new Error(`Missing terminal option: ${decision.status}`);
    return { reference: ref, ...decision, itemId: item.id, optionId: option?.id };
  };
  const results = [...new Set(references)].map(inspect);
  if (apply && results.some(r => !r.eligible)) throw new Error('Some selected closures lack verified human evidence; no writes performed.');
  for (const result of results) if (apply) {
    if (!state.viewerCanUpdate) throw new Error('Project write permission unavailable.');
    const fresh = inspect(result.reference);
    if (JSON.stringify(fresh) !== JSON.stringify(result)) throw new Error('Closure changed before write; re-review.');
    const query = 'query($id:ID!,$name:String!){node(id:$id){... on ProjectV2Item{fieldValueByName(name:$name){... on ProjectV2ItemFieldSingleSelectValue{optionId}}}}}';
    const read = () => graph(api, query, { id: result.itemId, name: field.name }).node?.fieldValueByName?.optionId;
    if (read() === result.optionId) { result.outcome = 'unchanged'; continue; }
    graph(api, `mutation{updateProjectV2ItemFieldValue(input:{projectId:${JSON.stringify(id)},itemId:${JSON.stringify(result.itemId)},fieldId:${JSON.stringify(field.id)},value:{singleSelectOptionId:${JSON.stringify(result.optionId)}}}){projectV2Item{id}}}`);
    if (read() !== result.optionId) throw new Error('Status readback mismatch; inspect before retrying.');
    result.outcome = 'mirrored';
  }
  return { mode: apply ? 'apply' : 'report', results };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), references = [];
    let root = process.cwd(), config, evidence = {}, apply = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--apply') apply = true;
      else if (['--root', '--config', '--issue', '--evidence'].includes(args[i]) && args[i+1]) {
        const key = args[i++], value = args[i];
        if (key === '--root') root = path.resolve(value);
        if (key === '--config') config = value;
        if (key === '--issue') references.push(value);
        if (key === '--evidence') evidence = JSON.parse(readFileSync(value, 'utf8'));
      } else throw new Error('Use --issue OWNER/REPO#N, optional --evidence FILE, --apply, --root PATH, --config RELATIVE.');
    }
    console.log(JSON.stringify(reconcileStatus(loadTracking(root, config), { references, evidence, apply }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
