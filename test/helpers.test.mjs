import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { refresh } from '../scripts/refresh-handbook.mjs';
import { reconcile } from '../scripts/enroll.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'handbook-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const remote = path.join(root, 'remote.git'), seed = path.join(root, 'seed'), clone = path.join(root, 'handbook');
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim();
  git(root, 'init', '--bare', remote);
  git(remote, 'symbolic-ref', 'HEAD', 'refs/heads/main');
  git(root, 'clone', remote, seed);
  git(seed, 'config', 'user.name', 'Fixture'); git(seed, 'config', 'user.email', 'fixture@example.invalid');
  writeFileSync(path.join(seed, 'policy.md'), 'one'); git(seed, 'add', '.'); git(seed, 'commit', '-m', 'fixture'); git(seed, 'branch', '-M', 'main'); git(seed, 'push', 'origin', 'main');
  git(root, 'clone', remote, clone);
  return { root, remote, seed, clone, git, run: () => refresh(clone, { origin: remote }) };
}
test('clean refresh fast-forwards and records the exact remote baseline', t => {
  const f = fixture(t); const first = f.run();
  writeFileSync(path.join(f.seed, 'policy.md'), 'two'); f.git(f.seed,'commit','-am','update'); f.git(f.seed,'push','origin','main');
  const next = f.run(); assert(next.fresh); assert.notEqual(first.revision, next.revision);
  assert.equal(next.revision, f.git(f.seed,'rev-parse','HEAD'));
});
test('dirty checkout is preserved and fallback points to immutable baseline', t => {
  const f = fixture(t); const baseline = f.run();
  writeFileSync(path.join(f.clone, 'policy.md'), 'local work');
  const result = f.run(); assert(!result.fresh); assert.equal(result.revision, baseline.revision);
  assert.equal(readFileSync(path.join(f.clone,'policy.md'),'utf8'),'local work');
  assert.equal(f.git(f.clone,'show',`${result.revision}:policy.md`),'one');
});
test('missing baseline blocks unsafe first use; unexpected remote is rejected', t => {
  const f = fixture(t); writeFileSync(path.join(f.clone,'policy.md'),'dirty');
  assert.throws(f.run,/no synchronized baseline/);
  assert.throws(() => refresh(f.clone),/Unexpected handbook origin/);
});
test('offline fallback keeps last successful baseline', t => {
  const f = fixture(t); const baseline = f.run();
  // Keep the configured origin identity but make its source unavailable.
  f.git(f.root,'config','--file',path.join(f.remote,'config'),'receive.denyCurrentBranch','ignore');
  rmSync(f.remote,{recursive:true,force:true});
  const result = f.run(); assert(!result.fresh); assert.equal(result.revision,baseline.revision);
});
test('ahead/diverged main and another branch are preserved', t => {
  const f = fixture(t); const baseline = f.run();
  f.git(f.clone,'config','user.name','Fixture'); f.git(f.clone,'config','user.email','fixture@example.invalid');
  writeFileSync(path.join(f.clone,'policy.md'),'local'); f.git(f.clone,'commit','-am','local');
  const head = f.git(f.clone,'rev-parse','HEAD');
  assert.equal(f.run().revision,baseline.revision); assert.equal(f.git(f.clone,'rev-parse','HEAD'),head);
  writeFileSync(path.join(f.seed,'policy.md'),'remote'); f.git(f.seed,'commit','-am','remote'); f.git(f.seed,'push','origin','main');
  assert(!f.run().fresh); assert.equal(f.git(f.clone,'rev-parse','HEAD'),head);
  f.git(f.clone,'checkout','-b','work'); assert(!f.run().fresh); assert.equal(f.git(f.clone,'branch','--show-current'),'work');
});
const config = { id:'P1',number:2,url:'https://github.com/orgs/Uniwares-LTD/projects/2',organization:'Uniwares-LTD',title:'Uniwares',repositories:['Uniwares-LTD/handbook'] };
function mock({ failWrite = false, graphErrors = false } = {}) {
  const enrolled = new Set(['I1']), writes = [];
  const api = args => {
    if (args.includes('graphql')) {
      const query = args.find(arg => arg.startsWith('query='));
      if (graphErrors) return { errors:[{message:'denied'}] };
      if (query.includes('mutation')) {
        if (failWrite) throw new Error('offline');
        const id = args.find(arg => arg.startsWith('content=')).slice(8); writes.push(id); enrolled.add(id);
        return {data:{addProjectV2ItemById:{item:{id:'ITEM'}}}};
      }
      return {data:{node:{title:'Uniwares',owner:{login:'Uniwares-LTD'},items:{nodes:[...enrolled].map(id=>({content:{id}})),pageInfo:{hasNextPage:false}}}}};
    }
    return [[{number:1,node_id:'I1',title:'Existing'},{number:2,node_id:'I2',title:'New'},{number:3,node_id:'PR',title:'PR',pull_request:{}}]];
  };
  return {api,writes};
}
test('report is read-only, omits PRs, and duplicate applies are idempotent', () => {
  const m=mock(); assert.deepEqual(reconcile(config,m).missing,[{reference:'Uniwares-LTD/handbook#2',title:'New'}]); assert.deepEqual(m.writes,[]);
  reconcile(config,{...m,apply:['Uniwares-LTD/handbook#1','Uniwares-LTD/handbook#2','Uniwares-LTD/handbook#2']});
  reconcile(config,{...m,apply:['Uniwares-LTD/handbook#2']}); assert.deepEqual(m.writes,['I2']);
});
test('failed API and GraphQL errors cannot be reported as successful enrollment', () => {
  assert.throws(()=>reconcile(config,{...mock({failWrite:true}),apply:['Uniwares-LTD/handbook#2']}),/offline/);
  assert.throws(()=>reconcile(config,mock({graphErrors:true})),/GraphQL returned errors/);
});
test('invalid selection fails before writes; unknown project is rejected', () => {
  const m=mock(); assert.throws(()=>reconcile(config,{...m,apply:['Uniwares-LTD/handbook#2','Uniwares-LTD/handbook#99']}),/not an accessible open issue/);
  assert.deepEqual(m.writes,[]); assert.throws(()=>reconcile({...config,title:'Wrong'},m),/identity/);
  assert.throws(()=>reconcile(config,{...m,apply:['Other/repo#1']}),/invalid issue/);
});
test('project number resolves to a GraphQL ID without requiring stored opaque IDs', () => {
  const m = mock();
  const api = args => args.some(arg => arg.includes('projectV2(number:2)')) ? {data:{organization:{projectV2:{id:'P1'}}}} : m.api(args);
  assert.equal(reconcile({...config,id:undefined},{api}).missing.length,1);
});
