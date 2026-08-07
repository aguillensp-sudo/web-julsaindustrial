---
description: Development rules for all Nortex web projects. Applies to all AI agents.
alwaysApply: true
---

# Nortex Web — Base Standards

Adapted from the Specboot `base-standards.md`. Where Specboot assumes a single
backend app, Nortex web work runs under **two profiles** (see
`profiles/PROFILE-SELECTION.md`). Rules below note where a profile changes them.

## 1. Core Principles

- **Small tasks, one at a time.** Baby steps; never skip ahead.
- **Test-Driven Development.** Mandatory for **Profile B**. For **Profile A**,
  tests only where they add value.
- **Type Safety.** Strict for Profile B; recommended for Profile A.
- **Clear Naming.** Descriptive variables and functions.
- **Incremental Changes.** Focused over large and complex.
- **Question Assumptions.** Always.
- **Pattern Detection.** Detect and flag repeated patterns.
- **Simplicity gate (Nortex).** Do not add a backend, a database, auth, or a build
  step a profile doesn't require. Complexity needs a concrete trigger.

## 2. Language Standards

- **Technical artifacts in English**: code, comments, commits, tests, schemas,
  config, technical docs.
- **Client-facing and Product-Owner artifacts in Spanish**: the client brief,
  the phases document, proposals and content shown to the client. This is a
  deliberate Nortex exception to the Specboot English-only rule, because clients
  are Spanish-speaking.

## 3. Specific standards

- `docs/frontend-standards.md` — web components, UI/UX, structure.
- `docs/content-standards.md` — tone, i18n, accessibility, on-page SEO.
- `docs/deployment-standards.md` — environments, domains, CI/CD, DNS.

## 4. Project Skills

Skills live in `ai-specs/skills`. Load the matching `SKILL.md` before continuing.

## 5. Planning Model Requirement

Planning workflows run with **Opus (high reasoning)** — current available Opus,
verified at the time of use. (The upstream Specboot pins an older Opus string;
Nortex uses the current one and checks it rather than hardcoding a stale version.)
Execution of code runs on GLM-5.2; validation returns to Opus.

## 6. Symlink Integrity and Multi-Agent Portability

`ai-specs` is canonical. `.claude` and `.cursor` reference it via symlinks.
No duplicated agents/skills across agent-specific folders. A change is incomplete
if it leaves broken symlinks or stale targets.

## 7. Mandatory OpenSpec Artifact Updates for Post-Apply Changes

A fix requested after `/apply` and before `/archive` is a **spec update first**,
not an informal quick fix. Update the change artifacts, regenerate if needed, then
code, then re-verify. Documentation is the source of truth.
