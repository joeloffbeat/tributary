---
description: Switch auth provider in frontend/ for development testing
argument: <thirdweb|reown|dynamic|privy|rainbowkit>
---

# Switch Auth Provider

Switch the auth provider in `frontend/` for development testing.

**Usage:** `/switch-auth {provider}`

## Available Providers

- `thirdweb` - Smart accounts, social login, x402 payments
- `reown` - WalletConnect AppKit, broad wallet support
- `dynamic` - Social login, embedded wallets
- `privy` - Email/social login, embedded wallets
- `rainbowkit` - Beautiful wallet modal, WalletConnect

## How to Execute

### Step 1: Load migration instructions

Read the migration guide for the target provider:

```
Read: registry/auth-providers/$ARGUMENTS/MIGRATION.md
```

### Step 2: Read provider metadata

Get file mappings and dependencies from:

```
Read: registry/auth-providers/$ARGUMENTS/meta.json
```

### Step 3: Execute migration

Follow the MIGRATION.md instructions:

1. **Uninstall current packages** - Run the uninstall commands for all other providers

2. **Install target packages** - Install dependencies listed in meta.json:
   ```bash
   cd frontend && npm install {dependencies from meta.json}
   ```

3. **Delete provider-specific files** - Remove files like `thirdweb-client.ts` from previous provider

4. **Copy files from registry** (for EACH file in meta.json `files` array):
   - Read source: `registry/auth-providers/$ARGUMENTS/frontend/{source}`
   - Write target: `frontend/{target}`
   - Create parent directories if needed
   - Repeat for all files in the array

5. **Set environment variables** - Check envVars in meta.json:
   - For EACH envVar, check if exists in `frontend/.env.local`
   - If missing, add with placeholder value

6. **Run build** - Verify with `cd frontend && npm run build`

### Step 4: Handle incompatible pages

Check meta.json for `incompatiblePages`. If switching away from Thirdweb, these pages will fail:
- `/x402/*` requires Thirdweb

Options:
1. Delete the incompatible pages temporarily
2. Comment out their route in the app
3. Leave them (build fails on those pages)

## Quick Reference

| Provider | Env Var | Key Package |
|----------|---------|-------------|
| thirdweb | `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | `thirdweb` |
| reown | `NEXT_PUBLIC_REOWN_PROJECT_ID` | `@reown/appkit` |
| dynamic | `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` | `@dynamic-labs/sdk-react-core` |
| privy | `NEXT_PUBLIC_PRIVY_APP_ID` | `@privy-io/react-auth` |
| rainbowkit | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `@rainbow-me/rainbowkit` |

## Important Notes

- **Interface layer** - All protocols use `@/lib/web3` abstraction, so switching is plug-and-play
- **Provider-specific exports** - Some providers expose extra features (e.g., `thirdwebClient`, `wagmiConfig`)
- **Preserve changes** - If you modified auth files, sync to registry before switching:
  ```bash
  cp frontend/lib/web3/*.ts registry/auth-providers/{current-provider}/frontend/lib/web3/
  ```

---

## Success Checklist

Before marking this task complete, verify:

- [ ] All files from meta.json copied to frontend
- [ ] Dependencies installed (check package.json)
- [ ] Environment variables set in `.env.local`
- [ ] Build passes: `cd frontend && npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] Connect button works in browser

**Run this to confirm:**
```bash
cd frontend
npm run build && echo "Build passed"
npm run dev &
# Open http://localhost:3000 and test connect button
```

---

## If This Fails

### Error: "Module not found: '@provider/sdk'"
**Cause:** Provider package not installed.
**Fix:**
1. Check meta.json for required dependencies
2. Run: `cd frontend && npm install {missing-package}`

### Error: "Cannot find module '@/lib/web3/...'"
**Cause:** File not copied from registry.
**Fix:**
1. Check meta.json `files` array
2. Copy missing file: `cp registry/auth-providers/{provider}/frontend/{source} frontend/{target}`

### Error: "Environment variable not set"
**Cause:** Required env var missing.
**Fix:**
1. Check meta.json `envVars` array
2. Add to `frontend/.env.local`: `NEXT_PUBLIC_XXX=your_value`
3. Get actual value from provider dashboard

### Error: "Type error: useAccount() incompatible"
**Cause:** Provider hooks don't match interface types.
**Fix:**
1. Check `registry/foundation/web3-interface/frontend/lib/web3/types.ts`
2. Update provider implementation to match interface
3. This is a bug in the provider - may need to fix implementation

### Error: Build fails on incompatible pages
**Cause:** Page requires features from different provider (e.g., /x402 needs Thirdweb).
**Fix:**
1. Check meta.json for `incompatiblePages`
2. Options:
   - Delete incompatible pages temporarily
   - Comment out route in app directory
   - Leave and fix after testing

### Error: "MIGRATION.md not found"
**Cause:** Provider missing migration guide.
**Fix:**
1. Check if MIGRATION.md exists: `ls registry/auth-providers/$ARGUMENTS/`
2. If missing, use meta.json files array directly
3. Follow general migration steps without specific guide

### Error: Wallet connects but transactions fail
**Cause:** Provider client configuration issue.
**Fix:**
1. Check `clients.ts` exports correct publicClient/walletClient
2. Verify chainId matches in config
3. Check wallet is on correct network

### General Debugging

1. Always backup current files before switching
2. Run `npm run build` after copying files to catch early errors
3. Check browser console for runtime errors
4. Verify env vars are set correctly (restart dev server after .env changes)
5. If totally stuck, restore from git and try again
