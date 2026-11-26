import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const progressHeading = '## Verified progress and resume';

export function fingerprint(text, kind) {
  if (kind !== 'plan' && kind !== 'prd') throw new Error('Expected plan or prd.');
  const normalized = text.replace(/\r\n/g, '\n');
  let approved = normalized;
  if (kind === 'plan') {
    let fence;
    let inComment = false;
    let foundBoundary = false;
    let offset = 0;
    for (const line of normalized.split('\n')) {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (fence) {
        if (marker?.[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      } else if (inComment) {
        if (line.includes('-->')) inComment = false;
      } else if (marker && (marker[1][0] === '~' || !marker[2].includes('`'))) {
        // Indented fences may belong to a Markdown list and end on dedent.
        if (line.startsWith(' ')) {
          approved = normalized;
          break;
        }
        fence = marker[1];
      } else if (line.startsWith('<!--')) {
        inComment = !line.includes('-->');
      } else if (/^ {0,3}<[a-z/!?]|<!--(?:(?!-->).)*$/i.test(line)) {
        // Raw HTML and inline multiline comments make the heading boundary ambiguous.
        // Hash the whole artifact and require a full comparison on any edit.
        return createHash('sha256').update(normalized, 'utf8').digest('hex');
      } else if (line.trimEnd() === progressHeading) {
        if (foundBoundary) throw new Error('Duplicate progress headings. Reconcile the complete plan.');
        approved = normalized.slice(0, offset);
        foundBoundary = true;
      } else if (foundBoundary && (/^ {0,3}#{1,2}(?:\s|$)/.test(line) || /^ {0,3}(?:=+|-+)[ \t]*$/.test(line))) {
        throw new Error('Progress must be the final section. Reconcile the complete plan.');
      }
      offset += line.length + 1;
    }
    if (fence || inComment) approved = normalized;
  }
  return createHash('sha256').update(approved, 'utf8').digest('hex');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [kind, file] = process.argv.slice(2);
  try {
    if (!file) throw new Error('Usage: node fingerprint.mjs plan|prd FILE');
    console.log(fingerprint(readFileSync(file, 'utf8'), kind));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
