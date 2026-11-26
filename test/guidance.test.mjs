import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogParity, toolNeutral, descriptionBudget, descriptionLimit, skillShape, alwaysLoaded, bodyLineLimit, alwaysLoadedLines } from '../scripts/guidance-lint.mjs';

const agents = 'Shared skills are in `.agents/skills`: work-on-task and review-change.\n';
const domains = '| Domain | Responsibility | Skills |\n| --- | --- | --- |\n| [Engineering](e.md) | Build | work-on-task, review-change; playwright for browser tooling |\n';
const base = { skills: ['work-on-task', 'review-change', 'playwright'], imported: ['playwright'], agents, domains };

test('workflow evaluation cases have stable unique IDs and observable criteria', () => {
  const guide = readFileSync(new URL('../docs/clients.md', import.meta.url), 'utf8');
  const section = guide.split('### Workflow behavior scenarios')[1]?.split('### Sample orchestration costs')[0];
  assert.match(section ?? '', /Fixture revision `\d{4}-\d{2}-\d{2}\.\d+`/);
  const rows = [...section.matchAll(/^\| (WF-\d{2}) \| ([^|]+) \| ([^|]+) \|$/gm)];
  assert.deepEqual(rows.map(row => row[1]), ['WF-01', 'WF-02', 'WF-03', 'WF-04', 'WF-05', 'WF-06']);
  for (const [, , input, observations] of rows) {
    assert(input.trim() && observations.trim());
  }
});

test('catalog parity passes when both catalogs match the skill set', () => {
  assert.deepEqual(catalogParity(base), []);
});
test('catalog parity reports missing and unknown skills in each catalog', () => {
  assert.deepEqual(catalogParity({ ...base, skills: [...base.skills, 'manage-issues'] }),
    ['docs/guidance/README.md: missing skill manage-issues.', 'AGENTS.md: missing shared skill manage-issues.']);
  assert.deepEqual(catalogParity({ ...base, skills: ['work-on-task', 'playwright'] }),
    ['docs/guidance/README.md: unknown skill review-change.', 'AGENTS.md: unknown skill review-change.']);
  assert.deepEqual(catalogParity({ ...base, domains: domains.replace('; playwright', '') }), ['docs/guidance/README.md: missing skill playwright.']);
  assert.match(catalogParity({ ...base, agents: 'No list here.' })[0], /missing the "Shared skills/);
});
test('imported skills need no AGENTS.md entry', () => {
  assert.deepEqual(catalogParity({ ...base, imported: [] }), ['AGENTS.md: missing shared skill playwright.']);
});
test('tool-neutral lint flags client-specific authority only', () => {
  assert.deepEqual(toolNeutral({ 'a.md': 'Agents may push after approval.', 'b.md': 'Claude Code reads CLAUDE.md.' }), []);
  assert.match(toolNeutral({ 'c.md': 'Codex may commit without asking.' })[0], /^c\.md: tool-specific authority wording "Codex may"/);
  assert.equal(toolNeutral({ 'd.md': 'Claude Code must stop.' }).length, 1);
});
test('description budget allows the limit and rejects longer descriptions', () => {
  const skill = description => `---\nname: x\ndescription: ${JSON.stringify(description)}\n---\n`;
  assert.deepEqual(descriptionBudget('x', skill('a'.repeat(descriptionLimit))), []);
  assert.match(descriptionBudget('x', skill('a'.repeat(descriptionLimit + 1)))[0], /1025 characters/);
});
test('skill shape needs a spec name, a "when" description, a bounded body and no nested AGENTS.md', () => {
  const skill = (description, body = 'Body.') => `---\nname: x\ndescription: ${description}\n---\n${body}\n`;
  assert.deepEqual(skillShape('good-skill', skill('Does X. Use when Y.'), ['.agents/skills/good-skill/SKILL.md']), []);
  assert.match(skillShape('Bad--Name', skill('Use when Y.'))[0], /lowercase letters/);
  assert.match(skillShape('x', skill('Does X.'))[0], /say when to use/);
  assert.match(skillShape('x', skill('Use when Y.', 'line\n'.repeat(bodyLineLimit + 1)))[0], /body is \d+ lines/);
  assert.match(skillShape('x', skill('Use when Y.'), ['.agents/skills/x/AGENTS.md'])[0], /would load as agent instructions/);
});
test('always-loaded instructions stay within the line and byte budget', () => {
  assert.deepEqual(alwaysLoaded('AGENTS.md', 'short\n'), []);
  assert.match(alwaysLoaded('AGENTS.md', 'x\n'.repeat(alwaysLoadedLines + 1))[0], /^AGENTS\.md: \d+ lines/);
});
