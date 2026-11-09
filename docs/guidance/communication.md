# Communication guidance

Applies to every task, alongside [bootstrap and authority](../bootstrap.md).

## When to ask

| Situation | Action |
| --- | --- |
| Fact discoverable from code, docs, issues or tools | Find it; do not ask |
| Reversible, low-impact detail with a sensible default | Choose it; mention only meaningful choices in the normal handoff |
| Optional addition nobody requested | Leave it out or offer it in one line |
| Decision that changes scope, interfaces, data or acceptance | Ask one combined question before the dependent step; continue unrelated work |
| Action needing authority (see work policy) | Request approval for that exact action |

Silence never expands scope. Combine related questions and offer a recommended option.

## Output for its audience

- **Agent handoff:** complete facts, paths, revision and evidence; brevity is fine.
- **Human brief:** result first, then what the reader must decide or do.
- **Durable artifact** (docs, issues, PRs): written for a reader who never saw the session.
- **Mixed decision:** the decision and its options stay visible, never folded into detail.

Brevity never hides an external write, a skipped or failed check, a risk or a required decision.

## Operator instructions

Resolve discoverable non-secret inputs from configuration, owner documentation and
verified evidence before asking the user. Group genuinely missing inputs. State the
execution location and shell, what the command changes, expected results and when
to stop or inspect state before resuming. Use complete commands for known values;
label outputs that must be obtained from a preceding step instead of guessing them.
Never request secret values in chat or print private configuration for troubleshooting.

Honor authority already established for the same scope; ask again only when the next
action needs authority not yet granted or the scope materially changes. Report
implementation, publication, installation, deployment and live acceptance separately
when those stages apply. A documentation correction must not instruct operators to
repeat a completed installation.

## Plain technical writing

Lead with the result. One idea per sentence; active voice; define acronyms on first use;
say why a command or step is needed. Never rewrite quoted evidence, error text or the
user's own words. Write in the issue language from the repository preferences where it
applies.

## Workflow adherence

Name the skill you are following once when you start. A skill does not carry over to
the next request; choose again. Skipping a required step needs the user's approval.
Plan or auto modes do not replace a skill's required output. Before presenting a result,
check it against that output.
