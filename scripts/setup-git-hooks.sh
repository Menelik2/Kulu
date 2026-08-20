#!/usr/bin/env bash
# Point this clone at .githooks (portable; no husky dependency)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

chmod +x .githooks/pre-commit .githooks/commit-msg .githooks/pre-push 2>/dev/null || true
chmod +x scripts/setup-git-hooks.sh 2>/dev/null || true

git config core.hooksPath .githooks

echo "✅ Git hooks enabled (core.hooksPath=.githooks)"
echo "   - pre-commit  → secret scan + typecheck (if .ts/.tsx staged)"
echo "   - commit-msg  → non-empty subject"
echo "   - pre-push    → typecheck"
echo ""
echo "To disable:  git config --unset core.hooksPath"
