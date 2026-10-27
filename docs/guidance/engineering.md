# Engineering guidance

Use the [common contract](../bootstrap.md). Start with local architecture, source map,
commands and the accepted outcome. Compile a bounded spec when consequential intent
is unclear; otherwise implement proportional changes with meaningful verification.
Review the final diff in a separate read-only pass and distinguish same-agent review
from independent review. Retest affected behavior after corrections.

Keep canonical docs and source-map references aligned with changed behavior. Preserve
historical evidence without presenting it as current acceptance. Route reusable lessons
to shared procedures, technology specifics to relevant skills, and local facts to the
project. Explicitly reconcile conflicting guidance and accepted exceptions.

Report actual tests and limitations, respecting local advisory validation policy.
Compilation/runtime failures remain failures. Implementation, publication, deployment
and live acceptance are separate outcomes governed by shared authority.
