---
layout: ../../layouts/Doc.astro
title: Quickstart
description: Get TimeCheese installed and log your first entry.
---

# Quickstart

## 1. Download & install

**Windows:** download the `.msi` installer and run it.

**macOS:** open the `.dmg` and drag TimeCheese into Applications. The app is unsigned, so the
first time you open it you may need to right-click the app and choose **Open** instead of
double-clicking — macOS Gatekeeper otherwise blocks it.

## 2. Request access

First time? Click **New here? Request access** on the sign-in screen. Enter your email, then
the 6-digit code that arrives, then choose a password. You'll land on a **waiting for admin
approval** screen — ping your admin, and once they approve you, click **Check again** to get in.
After that, just sign in with your email and password. See [Getting access](../getting-access/)
for the full walkthrough.

## 3. Log an entry

Pick a project, a date, a description, and a start/end time. TimeCheese validates the entry
against a few rules:

- Times must fall within **09:00–18:00**.
- Entries on the same day can't overlap.
- A day is capped at **8 worked hours** — the 12:00–13:00 lunch hour doesn't count toward the
  total.

## 4. Optional — enable Pro (Jira Assistant + Ask Claude)

Pro features need a locally installed [Claude Code](https://claude.com/claude-code) CLI (your own
subscription) plus the Atlassian MCP server. Install Claude Code, then add the MCP server:

<div class="terminal text-xs sm:text-sm"><span class="prompt">$</span>claude mcp add --scope user --transport http atlassian https://mcp.atlassian.com/v1/mcp/authv2</div>

TimeCheese detects the CLI automatically — the Jira tab lights up once it's found.
