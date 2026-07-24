# Release Process Guide

This document describes the exact steps to release a new version of `@gramaziokohler/compas-pb-ts`.

## Overview

The release process is **automated using release-please** and requires:
1. Making a trigger commit with conventional commit format
2. Pushing to main branch
3. Approving and merging the auto-generated release PR on GitHub
4. Approving and running the publish workflow

**Key Point**: All versioning, changelog, and tagging is handled automatically by release-please. You only need to make a code change and approve the workflows.

---

## Step 1: Make Your Changes

Make all code changes needed for the release. Examples:
- Bug fixes
- New features
- Documentation updates
- Dependency updates
- Configuration changes

**Important**: Changes should be complete, tested, and ready for production.

---

## Step 2: Test Locally

Before triggering the release, ensure everything works:

```bash
# Run linter
npm run lint

# Run tests
npm run test

# Build the project
npm run build

# Check size limit
npm run size
```

All checks must pass.

---

## Step 3: Create a Trigger Commit

Make a **final commit** that will trigger the release. This commit must use **conventional commit format**:

### Conventional Commit Format

```
<type>: <description>

[optional body]
```

**Type options:**
- `fix:` - Bug fixes (triggers patch version bump: `1.2.1` → `1.2.2`)
- `feat:` - New features (triggers minor version bump: `1.2.1` → `1.3.0`)
- `BREAKING CHANGE:` in body - Major breaking change (triggers major version bump: `1.2.1` → `2.0.0`)

### Common Examples

**For a patch release (bug fix):**
```bash
git add .
git commit -m "fix: adjust size limit for unminified build"
```

**For a minor release (new feature):**
```bash
git add .
git commit -m "feat: add new geometry type support"
```

**For a major release (breaking change):**
```bash
git add .
git commit -m "feat: redesign API structure

BREAKING CHANGE: The API has been completely redesigned"
```

**Example with body:**
```bash
git commit -m "fix: correct memory leak in cache

The cache was retaining references after clear() was called.
This fixes the issue by properly dereferencing all cached items."
```

---

## Step 4: Push to Main

Push your commit(s) to the main branch:

```bash
git push origin main
```

This triggers the `release-please` GitHub Actions workflow.

---

## Step 5: Wait for Release PR

1. Go to GitHub: https://github.com/gramaziokohler/compas_pb_ts
2. Navigate to **Pull Requests**
3. Look for a PR titled: `chore(main): release compas-pb-ts X.Y.Z`
4. This PR is automatically created by release-please within a few minutes

### What the PR Contains

The PR will automatically update:
- `package.json` - Version number updated
- `.release-please-manifest.json` - Version number updated
- `jsr.json` - Version number updated
- `CHANGELOG.md` - Release notes auto-generated from your commits

**Review the PR** to verify all changes look correct.

---

## Step 6: Merge the Release PR

1. **Review** the PR carefully - check the version bump and changelog
2. Click **"Merge pull request"**
3. Confirm the merge

**Important**: Do NOT use "Squash and merge" or "Rebase and merge" - use the default "Create a merge commit"

---

## Step 7: Release Tag Created Automatically

When the PR merges:
- A git tag is created: `compas-pb-ts-vX.Y.Z`
- The `publish` workflow is triggered

---

## Step 8: Verify Publish Workflow

1. Go to GitHub **Actions**
2. Look for the latest run of `release-please` workflow
3. Wait for both jobs to complete:
   - `release-please` (completes first)
   - `publish` (runs only if `release_created == 'true'`)

### Publish Job Details

The `publish` job will:
- Run linter: `pnpm lint`
- Run tests: `pnpm test`
- Build: `pnpm build`
- Publish to npm: `npm publish --access public --provenance`
- Publish to JSR: `pnpm dlx jsr publish`

If any step fails, the job stops and you'll see the error in the logs.

---

## Step 9: Verify Release Published

Check that the package is available on both registries:

### Check NPM
```bash
npm view @gramaziokohler/compas-pb-ts@X.Y.Z
```

Or visit: https://www.npmjs.com/package/@gramaziokohler/compas-pb-ts

### Check JSR
Visit: https://jsr.io/@gramaziokohler/compas-pb-ts

Both should show version `X.Y.Z` within a few minutes.

---

## Step 10: Verify Locally (Optional)

Install the new version in a test project:

```bash
npm install @gramaziokohler/compas-pb-ts@X.Y.Z
```

Test that it works correctly.

---

## Troubleshooting

### Problem: Publish Job is Skipped

**Cause**: The release PR was not merged properly, or `release_created` output is not `true`.

**Solution**:
1. Check the `release-please` job output in GitHub Actions
2. Verify the PR was merged (not draft/closed)
3. Check git tag was created: `git tag -l | grep vX.Y`
4. If stuck, manually trigger workflow from Actions tab using `workflow_dispatch`

### Problem: Locked Lockfile Error

**Cause**: `pnpm-lock.yaml` is out of sync with `package.json`

**Solution**:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
git push origin main
```

Then create your release trigger commit.

### Problem: Size Limit Exceeded

**Cause**: Build output exceeds the limit in `package.json` size-limit config

**Solution**:
1. Update `package.json` size limit:
```json
{
  "size-limit": [
    {
      "path": "dist/index.js",
      "limit": "150 KB"
    }
  ]
}
```
2. Include this in your trigger commit

### Problem: Tests Fail in Publish Job

**Cause**: Code changes broke tests or tests are flaky

**Solution**:
1. Fix the failing tests locally
2. Verify with: `npm run test`
3. Commit the fix with conventional commit format
4. Push and start from Step 5 again

---

## Summary Checklist

- [ ] Made code changes
- [ ] All tests pass locally: `npm run test`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Created trigger commit with conventional format (`fix:`, `feat:`, etc.)
- [ ] Pushed to main: `git push origin main`
- [ ] Release PR created by release-please
- [ ] Reviewed release PR (version, changelog, files)
- [ ] Merged release PR to main
- [ ] Release tag created automatically
- [ ] Publish job runs and completes successfully
- [ ] Verified package on npm registry
- [ ] Verified package on JSR registry

---

## Example Full Release Session

```bash
# 1. Make your changes and test
npm run test    # ✓ Pass
npm run lint    # ✓ Pass
npm run build   # ✓ Pass

# 2. Create trigger commit
git add package.json
git commit -m "fix: adjust size limit for unminified build"

# 3. Push to main
git push origin main

# 4. [GitHub] Wait for release PR creation (2-5 minutes)
# 5. [GitHub] Review and merge the release PR
# 6. [GitHub] Watch publish job complete
# 7. [Terminal] Verify the release
npm view @gramaziokohler/compas-pb-ts@X.Y.Z
```

Done! ✅

---

## Additional Notes

### Release-Please Behavior

- **Detects** conventional commits since last release
- **Bumps version** based on commit types:
  - `fix:` → patch (`0.0.X`)
  - `feat:` → minor (`0.X.0`)
  - `BREAKING CHANGE:` → major (`X.0.0`)
- **Creates PR** with auto-updated files
- **Runs on push to main** and `workflow_dispatch` (manual trigger)

### Files Modified Automatically

These files are updated by release-please, **do NOT edit them manually**:
- `package.json` - version field
- `.release-please-manifest.json` - version tracking
- `jsr.json` - version field
- `CHANGELOG.md` - release notes

### Git Tags

After merge, a tag is automatically created:
- Format: `compas-pb-ts-vX.Y.Z`
- Visible in: `git tag -l`
- Used by publish workflow to identify release

### NPM Provenance

The publish job uses `--provenance` flag, which creates:
- Cryptographic proof of where the package came from
- Linked to this GitHub Actions run
- Visible on npm package page under "Provenance"
