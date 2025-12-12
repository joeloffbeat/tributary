# Playwright Testing Examples

## Basic Navigation and Verification

```
# Step 1: Navigate to page
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000" })

# Step 2: Take snapshot to see elements
mcp__playwright-1__browser_snapshot()

# Result shows:
# document
#   heading "Welcome to App"
#   button[0] "Get Started"
#   link[0] "Documentation"

# Step 3: Click button
mcp__playwright-1__browser_click({
  element: "Get Started button",
  ref: "button[0]"
})

# Step 4: Wait for navigation
mcp__playwright-1__browser_wait_for({ text: "Dashboard" })

# Step 5: Verify new page
mcp__playwright-1__browser_snapshot()
```

## Form Submission

```
# Navigate to form
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000/contact" })

# Get element refs
mcp__playwright-1__browser_snapshot()

# Result:
# textbox[0] "Name"
# textbox[1] "Email"
# textbox[2] "Message"
# button[0] "Submit"

# Fill form fields individually
mcp__playwright-1__browser_type({
  element: "Name input",
  ref: "textbox[0]",
  text: "John Doe"
})

mcp__playwright-1__browser_type({
  element: "Email input",
  ref: "textbox[1]",
  text: "john@example.com"
})

mcp__playwright-1__browser_type({
  element: "Message textarea",
  ref: "textbox[2]",
  text: "Hello, this is a test message."
})

# OR: Fill all at once
mcp__playwright-1__browser_fill_form({
  fields: [
    { name: "Name", type: "textbox", ref: "textbox[0]", value: "John Doe" },
    { name: "Email", type: "textbox", ref: "textbox[1]", value: "john@example.com" },
    { name: "Message", type: "textbox", ref: "textbox[2]", value: "Test message" }
  ]
})

# Submit
mcp__playwright-1__browser_click({
  element: "Submit button",
  ref: "button[0]"
})

# Verify success
mcp__playwright-1__browser_wait_for({ text: "Message sent successfully" })
```

## Wallet Connection Flow

```
# Navigate to app
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000" })

# Get initial state
mcp__playwright-1__browser_snapshot()
# Shows: button[0] "Connect Wallet"

# Click connect
mcp__playwright-1__browser_click({
  element: "Connect Wallet button",
  ref: "button[0]"
})

# Wait for modal
mcp__playwright-1__browser_wait_for({ text: "Select Wallet" })

# Get modal elements
mcp__playwright-1__browser_snapshot()
# Shows:
# dialog "Select Wallet"
#   button[0] "MetaMask"
#   button[1] "WalletConnect"
#   button[2] "Coinbase Wallet"

# Select wallet
mcp__playwright-1__browser_click({
  element: "MetaMask option",
  ref: "button[0]"
})

# Wait for connection (this would require actual wallet approval in real scenario)
mcp__playwright-1__browser_wait_for({ textGone: "Connect Wallet" })

# Verify connected state
mcp__playwright-1__browser_snapshot()
# Should show address or "Connected" state
```

## Testing Token Swap UI

```
# Navigate to swap page
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000/swap" })

# Get elements
mcp__playwright-1__browser_snapshot()

# Select token from dropdown
mcp__playwright-1__browser_click({
  element: "From token selector",
  ref: "button[0]"
})

mcp__playwright-1__browser_wait_for({ text: "Select Token" })

mcp__playwright-1__browser_snapshot()
# Shows token list

mcp__playwright-1__browser_click({
  element: "USDC token option",
  ref: "button[2]"
})

# Enter amount
mcp__playwright-1__browser_type({
  element: "Amount input",
  ref: "textbox[0]",
  text: "100"
})

# Wait for quote
mcp__playwright-1__browser_wait_for({ textGone: "Fetching quote..." })

# Verify quote displayed
mcp__playwright-1__browser_snapshot()

# Take screenshot for documentation
mcp__playwright-1__browser_take_screenshot({
  filename: "swap-quote.png"
})
```

## Responsive Testing

```
# Test mobile view
mcp__playwright-1__browser_resize({ width: 375, height: 667 })

mcp__playwright-1__browser_navigate({ url: "http://localhost:3000" })

mcp__playwright-1__browser_snapshot()

# Should see hamburger menu instead of nav links
# button[0] "Menu" (hamburger)

mcp__playwright-1__browser_click({
  element: "Menu hamburger button",
  ref: "button[0]"
})

# Verify mobile menu opens
mcp__playwright-1__browser_wait_for({ text: "Navigation" })

mcp__playwright-1__browser_take_screenshot({
  filename: "mobile-menu.png"
})

# Test tablet view
mcp__playwright-1__browser_resize({ width: 768, height: 1024 })
mcp__playwright-1__browser_snapshot()

# Test desktop view
mcp__playwright-1__browser_resize({ width: 1920, height: 1080 })
mcp__playwright-1__browser_snapshot()
```

## Error Handling Verification

```
# Test form validation
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000/form" })

# Submit empty form
mcp__playwright-1__browser_snapshot()

mcp__playwright-1__browser_click({
  element: "Submit button",
  ref: "button[0]"
})

# Verify validation errors
mcp__playwright-1__browser_wait_for({ text: "Required" })

mcp__playwright-1__browser_snapshot()
# Should show error states on required fields

# Check console for errors
mcp__playwright-1__browser_console_messages({ onlyErrors: true })
```

## API Request Verification

```
# Navigate to page that makes API call
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000/data" })

# Wait for data to load
mcp__playwright-1__browser_wait_for({ textGone: "Loading..." })

# Check network requests
mcp__playwright-1__browser_network_requests()

# Result shows:
# {
#   "requests": [
#     {
#       "url": "http://localhost:3000/api/data",
#       "method": "GET",
#       "status": 200
#     }
#   ]
# }

# Verify data displayed
mcp__playwright-1__browser_snapshot()
```

## Dialog Handling

```
# Trigger confirmation dialog
mcp__playwright-1__browser_click({
  element: "Delete button",
  ref: "button[0]"
})

# Handle the confirmation
mcp__playwright-1__browser_handle_dialog({
  accept: true
})

# OR reject
mcp__playwright-1__browser_handle_dialog({
  accept: false
})

# For prompt dialogs
mcp__playwright-1__browser_handle_dialog({
  accept: true,
  promptText: "my input value"
})
```

## Keyboard Navigation

```
# Navigate to form
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000/form" })

# Focus first input
mcp__playwright-1__browser_click({
  element: "First input",
  ref: "textbox[0]"
})

# Tab through form
mcp__playwright-1__browser_press_key({ key: "Tab" })
mcp__playwright-1__browser_press_key({ key: "Tab" })
mcp__playwright-1__browser_press_key({ key: "Tab" })

# Submit with Enter
mcp__playwright-1__browser_press_key({ key: "Enter" })

# Escape to close modal
mcp__playwright-1__browser_press_key({ key: "Escape" })
```

## Parallel Testing (Multiple Sessions)

```
# Session 1: Test user A flow
mcp__playwright-1__browser_navigate({ url: "http://localhost:3000" })
mcp__playwright-1__browser_snapshot()

# Session 2: Test user B flow (in parallel)
mcp__playwright-2__browser_navigate({ url: "http://localhost:3000" })
mcp__playwright-2__browser_snapshot()

# Session 3: Test admin flow (in parallel)
mcp__playwright-3__browser_navigate({ url: "http://localhost:3000/admin" })
mcp__playwright-3__browser_snapshot()

# Each session maintains independent state
# Useful for testing multi-user scenarios
```

## Cleanup

```
# Always close browsers when done
mcp__playwright-1__browser_close()
mcp__playwright-2__browser_close()
mcp__playwright-3__browser_close()
```
