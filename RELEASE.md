# Release Instructions

## 🔵 Supabase Fork - Automated Releases

**This fork (`supabase/phoenix`) uses automated releases** via [release-please](https://github.com/googleapis/release-please) and npm trusted publishing.

### Versioning Strategy

This fork uses **independent semantic versioning** based on JavaScript API changes only.

- Versions are NOT coupled to Phoenix framework releases
- Version bumps reflect actual JS API changes (breaking/feature/fix)
- We regularly merge upstream Phoenix changes and version based on their JS impact

### Upstream Merge Workflow

When merging changes from [phoenixframework/phoenix](https://github.com/phoenixframework/phoenix):

1. **Merge upstream changes**:
   ```bash
   git remote add upstream https://github.com/phoenixframework/phoenix.git
   git fetch upstream
   git merge upstream/main
   # Or cherry-pick specific commits
   ```

2. **Evaluate JS impact**: Review changes in `assets/js/phoenix/`
   - Ignore Elixir-only changes
   - Focus on JavaScript API changes

3. **Commit with conventional commit**:
   - Breaking JS change: `feat!: merge upstream Phoenix X.Y.Z with breaking changes`
   - New JS feature: `feat: merge upstream Phoenix X.Y.Z with new features`
   - Bug fix only: `fix: merge upstream Phoenix X.Y.Z bug fixes`

4. **release-please will version appropriately** based on commit type:
   - `feat!:` → Major bump (0.x → 1.0, 1.x → 2.0)
   - `feat:` → Minor bump (0.1 → 0.2)
   - `fix:` → Patch bump (0.1.0 → 0.1.1)

5. **Update README** with new upstream Phoenix version and sync date

### How It Works

1. **Make changes** using [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` - New features (minor version bump)
   - `fix:` - Bug fixes (patch version bump)
   - `feat!:` or `BREAKING CHANGE:` - Breaking changes (major version bump)

2. **Merge to main** - release-please analyzes commits and creates/updates a release PR

3. **Merge release PR** - Workflow automatically:
   - Builds assets (`mix assets.build`)
   - Publishes to npm as `@supabase/phoenix`
   - Creates GitHub release
   - Uses OIDC trusted publishing (no npm token needed)

### Preview Releases

To test changes before merging, you can publish a preview package:

1. **Add label** `trigger: preview` to your PR
2. Workflow automatically publishes a preview package via [pkg-pr-new](https://github.com/stackblitz-labs/pkg.pr.new)
3. Comment appears on PR with installation instructions

**Usage:**
```bash
# The preview package URL will be provided in the PR comment
npm install https://pkg.pr.new/@supabase/phoenix@<pr-number>
```

This allows you to test the exact build from your PR branch without publishing to npm.

### Assets Build Workflow

Built assets in `priv/static/` are kept in sync with source files via the Assets workflow:

**When it runs:**
- Automatically on push to `main` or version branches (`v*.*`)
- When source files in `assets/js/phoenix/` change

**What it does:**
1. Runs `mix assets.build` to rebuild assets
2. If built files changed, creates a PR with updates
3. PR is labeled `automated` and `assets`
4. Merge the PR to sync built assets to main

**Why:** The npm package exports built files from `priv/static/`. Keeping them in git ensures consistency between git and published packages.

## 🔴 Upstream Phoenix - Manual Release Process

> **Note**: The following manual process is used by upstream [phoenixframework/phoenix](https://github.com/phoenixframework/phoenix). This Supabase fork uses the automated process above instead.

### Manual Steps

  1. Check related deps for required version bumps and compatibility (`phoenix_ecto`, `phoenix_html`)
  2. Bump version in related files below
  3. Bump external dependency version in related external files below
  4. Run tests:
      - `mix test` in the root folder
      - `mix test` in the `installer/` folder
  5. Commit, push code
  6. Publish `phx_new` and `phoenix` packages and docs after pruning any extraneous uncommitted files
  7. Test installer by generating a new app, running `mix deps.get`, and compiling
  8. Publish to `npm` with `npm publish`
  9. Update Elixir and Erlang/OTP versions on new.phoenixframework.org
  10. Start -dev version in related files below

### Files with version

  * `CHANGELOG`
  * `mix.exs`
  * `installer/mix.exs`
  * `package.json`
  * `assets/package.json`

### Files with external dependency versions

  * `priv/templates/phx.gen.release/Docker.eex` (debian)
  * `priv/templates/phx.gen.release/Docker.eex` (esbuild)
