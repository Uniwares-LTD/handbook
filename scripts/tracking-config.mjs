import { readFileSync, existsSync, lstatSync } from 'node:fs';
import path from 'node:path';

export const repositoryPattern = /^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/;
export const stages = ['Backlog', 'Ready', 'In progress', 'In review', 'Done', 'Cancelled'];
export function localFile(root, reference) {
  if (typeof reference !== 'string' || !reference || /[:\\#]/.test(reference)) throw new Error('Use a repository-relative tracking reference.');
  const target = path.resolve(root, reference), relative = path.relative(path.resolve(root), target);
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error('Tracking reference must stay inside the consumer.');
  let current = path.resolve(root);
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Tracking references cannot traverse symlinks.');
  }
  return target;
}
export function validateTracking(config) {
  if (!config || (config.version !== undefined && config.version !== 1) || (config.provider !== undefined && config.provider !== 'github')) throw new Error('Unsupported tracking configuration; preserve the existing tracker.');
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(config.organization ?? '')) throw new Error('Configure the repository organization.');
  if (!Array.isArray(config.repositories) || !config.repositories.length || config.repositories.some(r => !repositoryPattern.test(r) || r.split('/')[0].toLowerCase() !== config.organization.toLowerCase())) throw new Error('Include explicit repositories from the selected organization only.');
  if (!config.title || typeof config.title !== 'string') throw new Error('Configure a project title.');
  if (config.number !== undefined && (!Number.isSafeInteger(config.number) || config.number < 1)) throw new Error('Invalid project number.');
  if (config.number && config.url !== `https://github.com/orgs/${config.organization}/projects/${config.number}`) throw new Error('Project URL must match organization and number.');
  if (!config.number && !['repository', 'organization'].includes(config.scope)) throw new Error('Select reuse by number or creation scope repository|organization.');
  if (config.scope === 'repository' && config.repositories.length !== 1) throw new Error('Repository-scoped projects require one repository.');
  const mapping = config.statuses ?? Object.fromEntries(stages.map(name => [name, name]));
  if (stages.some(name => typeof mapping[name] !== 'string' || !mapping[name].trim()) || new Set(Object.values(mapping)).size !== stages.length) throw new Error('Provide distinct mappings for all six lifecycle stages.');
  return config;
}
export function loadTracking(root = process.cwd(), explicit) {
  const integration = path.join(root, 'handbook.json');
  const reference = explicit ?? (existsSync(integration) ? JSON.parse(readFileSync(integration, 'utf8')).tracking : undefined);
  if (!reference) throw new Error('No consumer tracking selection. Inventory projects and record the user choice in handbook.json; no Handbook project fallback.');
  const config = validateTracking(JSON.parse(readFileSync(localFile(root, reference), 'utf8')));
  if (config.policy) localFile(root, config.policy);
  return config;
}
