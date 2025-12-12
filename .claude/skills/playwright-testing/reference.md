# Playwright Testing Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Find elements | `browser_snapshot` | `browser_take_screenshot` | Get refs for interaction |
| Click button | `browser_click` with element + ref | Just ref | Permission requires element desc |
| Wait for result | `browser_wait_for({ text })` | `browser_wait_for({ time })` | More reliable |
| Fill form | `browser_fill_form` | Multiple `browser_type` | Single operation |
| Document result | `browser_take_screenshot` | `browser_snapshot` | Visual record |
| Debug issue | `browser_console_messages` | Guess | See errors |
| Test responsive | `browser_resize` first | Default viewport | Control viewport |
| Parallel tests | Different sessions (1, 2, 3) | Sequential | Faster execution |

---

## MCP Tool Reference

### Navigation

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser_navigate` | `url: string` | Navigate to URL |
| `browser_navigate_back` | - | Go back in history |

### Inspection

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser_snapshot` | - | Get accessibility tree with element refs |
| `browser_take_screenshot` | `filename?: string`, `fullPage?: boolean`, `element?: string`, `ref?: string` | Capture screenshot |
| `browser_console_messages` | `onlyErrors?: boolean` | Get console logs |
| `browser_network_requests` | - | Get all network requests |

### Interaction

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser_click` | `element: string`, `ref: string`, `button?: 'left'\|'right'\|'middle'`, `doubleClick?: boolean`, `modifiers?: string[]` | Click element |
| `browser_type` | `element: string`, `ref: string`, `text: string`, `submit?: boolean`, `slowly?: boolean` | Type into element |
| `browser_press_key` | `key: string` | Press keyboard key |
| `browser_hover` | `element: string`, `ref: string` | Hover over element |
| `browser_select_option` | `element: string`, `ref: string`, `values: string[]` | Select dropdown option |
| `browser_fill_form` | `fields: Field[]` | Fill multiple form fields |
| `browser_drag` | `startElement: string`, `startRef: string`, `endElement: string`, `endRef: string` | Drag and drop |

### Forms

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser_file_upload` | `paths: string[]` | Upload files |
| `browser_fill_form` | `fields: Field[]` | Fill multiple fields at once |

### Waiting

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser_wait_for` | `text?: string`, `textGone?: string`, `time?: number` | Wait for condition |

### Control

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser_close` | - | Close browser |
| `browser_resize` | `width: number`, `height: number` | Resize window |
| `browser_handle_dialog` | `accept: boolean`, `promptText?: string` | Handle alert/confirm/prompt |
| `browser_tabs` | `action: 'list'\|'new'\|'close'\|'select'`, `index?: number` | Manage tabs |

### Advanced

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser_evaluate` | `function: string`, `element?: string`, `ref?: string` | Execute JavaScript |
| `browser_run_code` | `code: string` | Run Playwright code snippet |

## MCP Prefixes

| Session | Prefix |
|---------|--------|
| Session 1 | `mcp__playwright-1__` |
| Session 2 | `mcp__playwright-2__` |
| Session 3 | `mcp__playwright-3__` |

## Snapshot Element Refs

After calling `browser_snapshot`, you get refs like:

```
document
  heading "Welcome"
  button[0] "Connect Wallet"
  button[1] "Learn More"
  textbox[0] "Search..."
  link[0] "Home"
  link[1] "About"
```

Use these refs directly:
- `button[0]` - First button
- `textbox[0]` - First input
- `link[1]` - Second link

## Key Names for browser_press_key

| Key | Name |
|-----|------|
| Enter | `Enter` |
| Tab | `Tab` |
| Escape | `Escape` |
| Backspace | `Backspace` |
| Delete | `Delete` |
| Arrow keys | `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| Modifiers | `Shift`, `Control`, `Alt`, `Meta` |
| Functions | `F1` - `F12` |

## Form Field Types

For `browser_fill_form`:

```typescript
interface Field {
  name: string           // Human-readable description
  type: 'textbox' | 'checkbox' | 'radio' | 'combobox' | 'slider'
  ref: string            // Element ref from snapshot
  value: string          // Value to set (use 'true'/'false' for checkbox)
}
```

## Modifier Keys for Click

```typescript
modifiers: ['Alt', 'Control', 'ControlOrMeta', 'Meta', 'Shift']
```

## Network Status

```json
{
  "requests": [
    {
      "url": "http://localhost:3000/api/data",
      "method": "GET",
      "status": 200,
      "responseHeaders": {...}
    }
  ]
}
```

## Console Messages

```json
{
  "messages": [
    {
      "type": "log",
      "text": "App initialized",
      "location": "app.js:42"
    },
    {
      "type": "error",
      "text": "Failed to fetch",
      "location": "api.js:15"
    }
  ]
}
```

## Test Accounts (Anvil)

| Index | Address | Private Key |
|-------|---------|-------------|
| 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

## Common Viewport Sizes

| Device | Width x Height |
|--------|----------------|
| Desktop | 1920 x 1080 |
| Laptop | 1366 x 768 |
| Tablet | 768 x 1024 |
| Mobile | 375 x 667 |

## Error Handling

Common errors and solutions:

| Error | Solution |
|-------|----------|
| "Element not found" | Run `browser_snapshot` first, verify ref |
| "Permission denied" | Include `element` description with click |
| "Timeout" | Increase wait time, check if element exists |
| "Browser not installed" | Run `browser_install` |
