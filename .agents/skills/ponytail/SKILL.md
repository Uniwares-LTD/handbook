---
name: ponytail
description: "Focused simplification of an engineering approach. Use when the user says ponytail, be lazy, simplest solution or yagni, or asks to reduce over-engineering or bloat. Shared simplicity rules apply even without this skill."
argument-hint: "[off]"
license: MIT
---

# Ponytail

Follow [bootstrap](../../../docs/bootstrap.md) for scope and authority and the
[simplicity baseline](../../../docs/guidance/engineering.md#simplicity-baseline).
Use this skill only for the selected task. It grants no delegation, redesign or
external-write authority.

## Focused simplification

Inspect the requested outcome, accepted decisions and affected code paths and flows.
Check existing project code, platform features and installed dependencies before
adding custom machinery. Choose the smallest clear, complete approach supported by
evidence for open decisions. Preserve explicit design commitments; suggest alternatives
as advice rather than replacing them without authorization.

Evaluate the total implementation and maintenance burden. Delete unnecessary work
where authorized, but retain necessary abstractions, required behavior, validation,
error handling, security and accessibility. Complete affected callers and fixtures;
use the engineering guidance's abstraction threshold and proportional validation
cadence, not a one-line target or a test quota. Record material known limits and their
revisit triggers in the appropriate existing code or documentation.

Keep investigation silent unless it reveals a meaningful choice or finding. Report
material changes, actual plan divergence and relevant verification limits in the
existing handoff. Do not require an alternatives menu, public surface inventory or
closing disclaimer. For a requested review, use review-change and remain read-only.

## Invocation compatibility

There is one behavior. Legacy `lite`, `full` and `ultra` arguments invoke this same
behavior without extra authority. `off` or "stop ponytail" ends the focused skill;
the shared simplicity baseline still applies. Activation does not carry into a new
request unless selected again.
