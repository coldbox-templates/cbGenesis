---
title: Built for AI-Assisted Development
order: 3
icon: phosphor-duotone:robot
summary: Why starting from cbGenesis costs measurably fewer tokens and produces more consistent code than having an AI agent build your auth, RBAC, and admin panel from a blank repository.
tags: [ai, agents, skills, productivity]
---

# Built for AI-assisted development

Every serious app today gets built with an AI coding agent somewhere in the loop. The question isn't whether you'll use one - it's whether that agent starts from a blank repository and has to *guess* your conventions every session, or starts from a codebase that already tells it exactly how things are done here.

cbGenesis is built for the second case.

## The real cost of "just build it with AI"

Handing an agent a blank ColdBox app and asking for auth, RBAC, an admin panel, CSRF protection, and a test suite doesn't just cost you the agent's time - it costs tokens, and it costs consistency. Without a codebase to anchor it, an agent:

- Explores the (empty) project, finds nothing, and either invents its own conventions or asks you a dozen clarifying questions.
- Re-derives the same security-sensitive plumbing - session auth, CSRF verification, permission checks - every time, with no guarantee it gets the subtle parts right (rotation windows, deny-by-default checks, self-action guards) that took real incidents to discover here.
- Has nothing to imitate, so every file it writes can drift a little further from the last one - two features built two weeks apart start looking like they came from different codebases.

cbGenesis ships all of that already built, tested, and - critically for an AI agent - **documented as machine-readable skills**, not just prose a human has to translate into instructions.

## What ships specifically for agents

- **`AGENTS.md`** at the repository root - the single file most agent tooling (Claude Code, Copilot, Cursor, and others) loads automatically, describing the app's structure, handlers, interceptors, and conventions before the agent writes a line of code.
- **90+ framework skills**, auto-installed by the ColdBox CLI, covering BoxLang, ColdBox, CommandBox, TestBox, WireBox, and every bundled module (cbSecurity, cbORM, qb, cbMailServices) - step-by-step implementation patterns an agent loads on demand instead of guessing from training data that may predate the current API.
- **Six cbGenesis-specific skills** (`.agents/skills-custom/`) that capture what the framework skills *can't* know - this app's own `resource:action` permission model, its `fetchWithCsrf()` frontend contract, the exact entity/service/handler/route/component shape a new feature here follows, its real test-isolation mechanism, and its env-var-vs-database settings split. See [Extending the App](guides/extending.md) for the full list.
- **Live MCP documentation servers** for every framework and module in the stack, so an agent checks current docs instead of relying on a training cutoff.

None of this is a "prompt engineering" trick. It's the same thing that makes a new human hire productive faster: a codebase with conventions worth copying, and a map of where to find them.

## We measured it, not just claimed it

Claims about AI productivity are cheap. So we ran an actual, reproducible test instead of asserting a number.

**The task:** add a complete CRUD resource ("Tags") to this exact cbGenesis codebase - an ORM entity, a service, a permission-gated JSON handler, a route, and an Alpine.js frontend component with correct CSRF handling. The same well-defined task, given to two independent agents, on the same commit, with the same model.

**Condition A - exploration only.** The agent was told not to consult any of cbGenesis's custom skills and had to reverse-engineer the conventions itself: which files define the permission format, how the existing handlers shape a JSON response, how the frontend recovers from a stale CSRF token, where routes get registered.

**Condition B - skill-assisted.** The agent was pointed at the three relevant custom skills first (`cbgenesis-crud-resource`, `cbgenesis-csrf-frontend`, `cbgenesis-rbac-permissions`) and implemented directly from what they said.

Both agents produced a complete, working vertical slice. Here's what it cost:

| | Exploration only | Skill-assisted |
|---|---|---|
| **Tokens** | 129,672 | **113,995** |
| **Tool calls** | 38 | **22** |
| **Wall time** | 208s | **137s** |

That's **12% fewer tokens**, **42% fewer tool calls**, and **34% less time** for identical scope, on a single measured run. The token gap alone understates the win: every agent invocation carries a large, fixed overhead (system prompt, tool definitions) that's identical in both conditions, so nearly all of that reduction comes out of the *task-specific* work - the part that's actually exploration versus direct execution.

**Being straight about the methodology:** this was one run per condition, not an averaged benchmark, so treat the exact percentages as directional rather than a guarantee - your mileage will vary with task complexity and model. Both conditions still had cbGenesis's baseline `AGENTS.md` project overview available (most agent tooling loads it automatically and there's no clean way to hide it), so even the "exploration only" condition wasn't working from *total* darkness - it still had to go find the specific implementation patterns on its own. Run the comparison yourself on a task you care about; we'd rather you verify it than take our word for it.

The tool-call gap is the more telling number: 38 versus 22 is not "the agent thought a little less," it's the difference between *reading half the codebase to find the pattern* and *reading the pattern*.

## The case beyond tokens

Tokens are the easy thing to measure. The harder-to-quantify win is what doesn't happen: an agent building a login flow, a permission check, or a CSRF-protected form on top of cbGenesis inherits patterns that were already hardened against real mistakes (a stale CSRF token silently discarding a user's input, a permission relationship silently failing to clear, a self-action guard applied inconsistently) - mistakes this project has actually made, fixed, and then encoded into a skill so an agent doesn't make them again on your project.

Building "from scratch with AI" means every one of those lessons has to be relearned, per project, the hard way. Starting from cbGenesis means they're already paid for.

## Where to go next

::: cards
::: card title="Getting Started" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Install, configure, migrate, and run the app locally.
:::
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
See the custom skills in context - what they cover, and how to add your own as the app grows.
:::
::: card title="Security & Permissions" icon="phosphor-duotone:shield-check" href="guides/security.md"
The `resource:action` model, CSRF, and the conventions the skills above encode.
:::
:::
