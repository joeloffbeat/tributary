# UI Component Library

Consolidated components for Web3, AI, and full-stack products.

---

## Web3 - Wallet

| Component | Description |
|-----------|-------------|
| ConnectWalletButton | Connected: avatar + truncated address + balance + dropdown (copy, details dialog, disconnect). Disconnected: "Connect Wallet" |
| NetworkSwitcher | Dropdown to switch chains with icons, current chain display, testnet indicator |
| GasButton | Navbar button with popover showing gas prices (slow/standard/fast), congestion status, USD estimates |

---

## Web3 - Tokens

| Component | Description |
|-----------|-------------|
| TokenInput | Amount input with: token selector modal, balance, max button, USD conversion, validation |
| TokenList | Searchable list with icon, symbol, balance, USD value per row |
| TokenPair | Overlapping icons for LP/pairs display |

---

## Web3 - Transactions

| Component | Description |
|-----------|-------------|
| TxProgressModal | Multi-step modal: Approve → Sign → Processing → Done/Failed with hash link |
| TxToast | Toast with status icon, message, hash link, auto-dismiss on success |
| TxHistoryList | List of transactions with type, amount, status badge, timestamp, explorer link |

---

## Web3 - DeFi

| Component | Description |
|-----------|-------------|
| SwapCard | Complete swap UI: two TokenInputs, swap direction button, rate display, slippage settings, route preview, details accordion |
| StakeCard | Stake/Unstake tabs, amount input, APY display, lock duration selector, rewards summary |
| LendingMetrics | Health factor gauge, collateral ratio bar, borrow limit bar, liquidation warning |
| PositionCard | User position: value, PnL, earnings, action buttons |

---

## Web3 - Perps Trading

| Component | Description |
|-----------|-------------|
| TradingInterface | Full TradingView-style layout: candlestick chart, order book, trade history, positions panel, order form |
| TradingChart | TradingView candlestick chart with indicators, drawing tools, timeframe selector, fullscreen |
| OrderBook | Live order book with bid/ask depth, spread display, click-to-fill price |
| OrderForm | Long/Short tabs, Market/Limit/Stop types, leverage slider, size input, margin display, liquidation price |
| PositionsTable | Open positions with entry price, mark price, PnL, liquidation price, close/TP/SL actions |
| TradeHistory | Recent trades feed with price, size, side, timestamp |

---

## Web3 - Prediction Markets

| Component | Description |
|-----------|-------------|
| MarketCard | Question, Yes/No odds, volume, resolution date, outcome bar, quick bet buttons |
| BetPanel | Yes/No selection, amount input, potential payout calculator, shares display, submit |
| OddsDisplay | Dynamic odds with implied probability %, price movement indicator |
| MarketChart | Price/probability chart over time for market outcomes |
| PositionsList | User bets with outcome, shares, avg price, current value, PnL, sell option |
| ResolutionBanner | Market status: Open/Pending/Resolved with countdown or final outcome |

---

## Web3 - NFT

| Component | Description |
|-----------|-------------|
| NFTCard | Image/media, name, collection, price, rarity badge |
| NFTDetail | Full view: media viewer (img/video/audio/3D), attributes grid, history, actions |
| NFTGrid | Responsive grid with virtualization, lazy loading, filters |

---

## Web3 - Bridge

| Component | Description |
|-----------|-------------|
| BridgeCard | From/To chain selectors, amount input, quote display (fees, time, receive amount), route options |
| BridgeProgress | Multi-step tracker: Initiated → Confirming → Bridging → Complete |

---

## Web3 - Governance

| Component | Description |
|-----------|-------------|
| ProposalCard | Title, status badge, vote bar (For/Against/Abstain %), quorum progress, deadline |
| VotePanel | Voting power display, For/Against/Abstain buttons, delegation option |

---

## AI - Chat

| Component | Description |
|-----------|-------------|
| ChatInterface | Full chat: message list, input with attachments, conversation sidebar, model selector |
| ChatMessage | User/Assistant bubble with avatar, markdown/code rendering, actions (copy, regenerate, edit) |
| StreamingText | Typewriter effect with cursor, thinking indicator |

---

## AI - Code

| Component | Description |
|-----------|-------------|
| CodeBlock | Syntax highlighted code with language badge, copy button, line numbers, collapsible |
| CodeDiff | Side-by-side or inline diff view with additions/deletions highlighted |
| TerminalOutput | Monospace output with ANSI color support |

---

## AI - Generation

| Component | Description |
|-----------|-------------|
| ImageGenerator | Prompt input, style/size selectors, generation progress, result grid with variations |
| AudioPlayer | Waveform visualization, playback controls, speed adjustment, transcript display |

---

## AI - Agents

| Component | Description |
|-----------|-------------|
| AgentPanel | Execution status, tool calls list, reasoning steps, source citations |
| ToolCallCard | Tool name, parameters, result, execution time |

---

## Data - Tables

| Component | Description |
|-----------|-------------|
| DataTable | Sortable, filterable, paginated table with column customization, row selection, bulk actions, export |
| VirtualizedList | Performant scrolling for large datasets with variable row heights |

---

## Data - Charts

| Component | Description |
|-----------|-------------|
| LineChart | Time series with multiple datasets, zoom, tooltips, legend |
| BarChart | Vertical/horizontal bars, stacked/grouped variants |
| PieChart | Pie/donut with labels, legend, interactive segments |
| CandlestickChart | OHLC with volume, zoom, crosshair |
| Sparkline | Inline mini chart for tables/stats |

---

## Data - Stats

| Component | Description |
|-----------|-------------|
| StatCard | Value, label, trend arrow with %, optional sparkline |
| ProgressGauge | Circular or linear progress with value, label, color zones |

---

## Forms - Inputs

| Component | Description |
|-----------|-------------|
| Input | Text input with label, error, helper text, prefix/suffix icons |
| Textarea | Multi-line with auto-resize, character counter |
| Select | Single select with search, groups, custom rendering |
| MultiSelect | Multi-select with tags, search, select all |
| DatePicker | Single date, range, time picker variants |
| FileUpload | Drag-drop zone, file list, progress, preview |
| RichTextEditor | WYSIWYG with toolbar, markdown mode toggle |
| OTPInput | PIN/code input with auto-focus, paste support |

---

## Forms - Controls

| Component | Description |
|-----------|-------------|
| Checkbox | Checkbox with label, indeterminate state |
| RadioGroup | Radio buttons with descriptions, horizontal/vertical |
| Switch | Toggle with label, loading state |
| Slider | Range slider with marks, tooltip, range selection |

---

## Forms - Structure

| Component | Description |
|-----------|-------------|
| Form | Form wrapper with validation, error summary, submit handling |
| MultiStepForm | Phased form with step indicator, navigation (next/prev), validation per phase, progress bar, summary step |
| MultiStepFormDialog | Dialog version: modal with phased form, step indicator in header, close confirmation if dirty |
| FieldArray | Dynamic add/remove fields with reordering |

---

## Navigation

| Component | Description |
|-----------|-------------|
| Navbar | Top bar with logo, nav links, actions area (responsive with mobile menu) |
| Sidebar | Collapsible side nav with groups, icons, nested items, badges |
| Tabs | Horizontal/vertical tabs with icons, badges, lazy loading |
| Breadcrumbs | Path navigation with truncation, dropdown for long paths |
| Pagination | Page controls with size selector, total count, jump to page |
| CommandPalette | Cmd+K searchable command menu with categories, shortcuts |

---

## Feedback

| Component | Description |
|-----------|-------------|
| Toast | Notification with variants (success/error/warning/info), action button, dismiss |
| Alert | Inline message with icon, title, description, dismiss |
| Dialog | Modal with header, body, footer, sizes, scroll behavior |
| Sheet | Slide-out panel from any edge |
| Popover | Floating content anchored to trigger element |
| Tooltip | Hover hint with arrow, placement options |
| Skeleton | Loading placeholder matching content shape |
| Progress | Linear/circular progress with indeterminate mode |

---

## Layout

| Component | Description |
|-----------|-------------|
| Card | Container with header, body, footer, variants |
| Accordion | Collapsible sections, single/multi expand modes |
| ScrollArea | Custom scrollbar with fade edges |
| ResizablePanels | Draggable resize handles between panels |
| Carousel | Sliding content with dots, arrows, autoplay |
| Masonry | Pinterest-style grid layout |

---

## Display

| Component | Description |
|-----------|-------------|
| Avatar | Image with fallback initials/icon, sizes, status dot |
| Badge | Label with color variants, icon, removable |
| Tag | Removable pill with close button |
| Timestamp | Relative (2h ago) or absolute time with tooltip |
| CopyButton | Click to copy with success feedback |
| QRCode | Generate QR from string with download option |
| EmptyState | Illustration, title, description, action button |
| ErrorState | Error display with retry button |

---

## Actions

| Component | Description |
|-----------|-------------|
| Button | Variants (solid/outline/ghost), sizes, loading state, icon support |
| DropdownMenu | Menu with items, groups, sub-menus, shortcuts, icons |
| ContextMenu | Right-click menu |
| ActionBar | Floating toolbar for selected items with actions |

---

## Auth

| Component | Description |
|-----------|-------------|
| AuthCard | Login/signup form with social buttons, forgot password link, terms |
| UserMenu | Avatar dropdown with profile link, settings, logout |

---

## Commerce

| Component | Description |
|-----------|-------------|
| ProductCard | Image, title, price, rating, add to cart/wishlist |
| CartDrawer | Slide-out cart with items, quantity controls, totals, checkout |
| CheckoutForm | Multi-step: shipping, payment, review with order summary |
| PricingTable | Plan comparison with features, highlighted plan, CTA |

---

## 3D & Interactive

| Component | Description |
|-----------|-------------|
| InteractiveGlobe | 3D globe with rotation, zoom, click-to-select locations, markers, arcs between points, tooltip on hover |
| GlobeMarker | Customizable pin/marker on globe with pulse animation, popup content on click |
| GlobeArc | Animated arc connecting two points on globe (for transfers, connections) |
| WorldMap | 2D interactive map alternative with country selection, heatmap overlay, markers |

---

## Summary

- **Total Components:** 98
- **Categories:** 26
