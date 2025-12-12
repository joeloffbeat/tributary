---
name: playwright-testing
description: E2E testing with MCP Playwright sessions for browser automation. Use when testing UI flows, wallet interactions, or verifying frontend behavior.
---

# Playwright Testing Skill

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for all documentation lookups.**

```
1. Resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "playwright" })

2. Fetch docs for your specific task:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/microsoft/playwright",
     topic: "selectors",
     mode: "code"
   })

3. NEVER guess Playwright APIs - verify with Context7 first
4. Note: Use MCP tools, not direct Playwright CLI
```

---

## When to Use This Skill

Load this skill when:
- Testing UI flows end-to-end
- Verifying wallet connection flows
- Testing form submissions
- Checking responsive behavior
- Automating browser interactions

## Critical Rules

1. **ALWAYS use MCP tools** - Never run Playwright CLI directly
2. **Use browser_snapshot** - Preferred over screenshots for interaction
3. **Use refs from snapshot** - Get element refs before interacting
4. **Start dev server first** - Ensure `npm run dev` is running
5. **Clean up sessions** - Close browsers when done

## Available Sessions

Three parallel MCP browser sessions available:

| Session | MCP Prefix | Data Directory |
|---------|------------|----------------|
| Session 1 | `mcp__playwright-1__` | `.playwright-data/session-1/` |
| Session 2 | `mcp__playwright-2__` | `.playwright-data/session-2/` |
| Session 3 | `mcp__playwright-3__` | `.playwright-data/session-3/` |

## Decision Tree

```
Need to test something?
├─ Start dev server first: cd frontend && npm run dev
├─ Navigate to page: browser_navigate
├─ Get element refs: browser_snapshot
├─ Interact: browser_click / browser_type
├─ Verify: browser_snapshot / browser_wait_for
└─ Clean up: browser_close

Need to wait?
├─ For text to appear → browser_wait_for({ text: "..." })
├─ For text to disappear → browser_wait_for({ textGone: "..." })
├─ For fixed time → browser_wait_for({ time: 2 })
└─ For element → Use browser_snapshot then interact

Need to fill forms?
├─ Single field → browser_type with ref
├─ Multiple fields → browser_fill_form
└─ Select dropdown → browser_select_option

Need screenshot?
├─ For verification → Use browser_snapshot instead
├─ For documentation → browser_take_screenshot
└─ Full page → browser_take_screenshot({ fullPage: true })
```

## Common Tasks

### Testing a Page Flow

1. Start dev server: `cd frontend && npm run dev`
2. Navigate: `browser_navigate({ url: "http://localhost:3000" })`
3. Get snapshot: `browser_snapshot()` to see element refs
4. Interact: `browser_click({ element: "Button name", ref: "button[0]" })`
5. Verify: `browser_wait_for({ text: "Expected text" })`
6. Clean up: `browser_close()`

### Testing Form Submission

1. Navigate to form page
2. Get snapshot to find input refs
3. Fill fields: `browser_type({ element: "Input name", ref: "input[0]", text: "value" })`
4. Submit: `browser_click({ element: "Submit button", ref: "button[X]" })`
5. Verify result with snapshot or wait_for

### Testing Wallet Connection

1. Navigate to page with Connect button
2. Get snapshot, find Connect button ref
3. Click Connect button
4. Wait for wallet modal or connected state
5. Verify with snapshot

## MCP Tools Reference

### Navigation

```
mcp__playwright-1__browser_navigate
  url: "http://localhost:3000"

mcp__playwright-1__browser_navigate_back
```

### Inspection

```
mcp__playwright-1__browser_snapshot
  // Returns accessibility tree with element refs

mcp__playwright-1__browser_take_screenshot
  filename: "test-result.png"
  fullPage: true  // Optional
```

### Interaction

```
mcp__playwright-1__browser_click
  element: "Connect Wallet button"
  ref: "button[3]"

mcp__playwright-1__browser_type
  element: "Amount input"
  ref: "input[0]"
  text: "100"
  submit: true  // Optional: press Enter after
```

### Waiting

```
mcp__playwright-1__browser_wait_for
  text: "Transaction successful"  // Wait for text
  // OR
  textGone: "Loading..."          // Wait for text to disappear
  // OR
  time: 2                         // Wait N seconds
```

## Anti-Patterns (NEVER DO)

```
// NEVER run Playwright CLI directly
npx playwright test

// Use MCP tools
mcp__playwright-1__browser_navigate(...)

// NEVER guess refs
browser_click({ ref: "button[5]" })  // How do you know it's [5]?

// Get refs from snapshot first
browser_snapshot()  // See actual refs
browser_click({ ref: "button[3]", element: "Submit button" })

// NEVER skip the element description
browser_click({ ref: "button[3]" })  // Permission denied

// Always include element description
browser_click({ element: "Submit button", ref: "button[3]" })
```

## Test Flow Pattern

```
1. Navigate
   mcp__playwright-1__browser_navigate({ url: "http://localhost:3000" })

2. Get snapshot (get refs)
   mcp__playwright-1__browser_snapshot()
   // Returns: button[0], button[1], input[0], etc.

3. Interact
   mcp__playwright-1__browser_click({
     element: "Connect Wallet button",
     ref: "button[3]"
   })

4. Wait for result
   mcp__playwright-1__browser_wait_for({ text: "Connected" })

5. Verify
   mcp__playwright-1__browser_snapshot()
   // Check the new state

6. Clean up
   mcp__playwright-1__browser_close()
```

## Related Skills

- **ui-dev** - For building testable UI components
- **web3-integration** - For understanding wallet flows to test

## Quick Reference

| Action | Tool |
|--------|------|
| Open page | `browser_navigate` |
| Get elements | `browser_snapshot` |
| Click | `browser_click` |
| Type | `browser_type` |
| Wait for text | `browser_wait_for` |
| Take screenshot | `browser_take_screenshot` |
| Close | `browser_close` |

See `examples.md` for common test scenarios.
