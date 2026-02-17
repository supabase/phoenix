# Release Instructions

## 🔵 Supabase Fork - Automated Releases

**This fork (`supabase/phoenix`) uses automated releases** via [release-please](https://github.com/googleapis/release-please) and npm trusted publishing.

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
