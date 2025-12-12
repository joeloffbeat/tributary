# Test Flow Template

## Test: [FEATURE_NAME]

### Prerequisites
- [ ] Dev server running: `cd frontend && npm run dev`
- [ ] Test data prepared (if needed)
- [ ] Environment variables set

### Test Steps

#### 1. Setup
```
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000/[PAGE]" })
```

#### 2. Initial State Verification
```
mcp__playwright-1__browser_snapshot()

Expected elements:
- [ ] [Element 1]
- [ ] [Element 2]
- [ ] [Element 3]
```

#### 3. Action Sequence
```
# Step 3.1: [ACTION_DESCRIPTION]
mcp__playwright-1__browser_click({
  element: "[ELEMENT_DESCRIPTION]",
  ref: "[REF]"
})

# Step 3.2: Wait for response
mcp__playwright-1__browser_wait_for({ text: "[EXPECTED_TEXT]" })

# Step 3.3: [NEXT_ACTION]
mcp__playwright-1__browser_type({
  element: "[ELEMENT_DESCRIPTION]",
  ref: "[REF]",
  text: "[INPUT_VALUE]"
})
```

#### 4. Verification
```
mcp__playwright-1__browser_snapshot()

Expected state:
- [ ] [Expected element/text 1]
- [ ] [Expected element/text 2]
```

#### 5. Screenshot Evidence
```
mcp__playwright-1__browser_take_screenshot({
  filename: "[FEATURE]-[STATE].png"
})
```

#### 6. Cleanup
```
mcp__playwright-1__browser_close()
```

### Pass Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Notes
- [Any special considerations]
- [Known issues]
- [Edge cases to watch for]
