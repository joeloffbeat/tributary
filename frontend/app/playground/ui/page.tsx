'use client'

import { ArrowLeft, Check, Circle, Construction } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ComponentStatus = 'done' | 'in-progress' | 'planned'

interface ComponentItem {
  name: string
  description: string
  status: ComponentStatus
}

interface ComponentCategory {
  category: string
  components: ComponentItem[]
}

const componentList: ComponentCategory[] = [
  // ==================== WEB3 UI ====================
  {
    category: 'Web3 - Wallet',
    components: [
      { name: 'ConnectWalletButton', description: 'Connected: avatar + truncated address + balance + dropdown (copy, details dialog, disconnect). Disconnected: "Connect Wallet"', status: 'planned' },
      { name: 'NetworkSwitcher', description: 'Dropdown to switch chains with icons, current chain display, testnet indicator', status: 'planned' },
      { name: 'GasButton', description: 'Navbar button with popover showing gas prices (slow/standard/fast), congestion status, USD estimates', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - Tokens',
    components: [
      { name: 'TokenInput', description: 'Amount input with: token selector modal, balance, max button, USD conversion, validation', status: 'planned' },
      { name: 'TokenList', description: 'Searchable list with icon, symbol, balance, USD value per row', status: 'planned' },
      { name: 'TokenPair', description: 'Overlapping icons for LP/pairs display', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - Transactions',
    components: [
      { name: 'TxProgressModal', description: 'Multi-step modal: Approve → Sign → Processing → Done/Failed with hash link', status: 'planned' },
      { name: 'TxToast', description: 'Toast with status icon, message, hash link, auto-dismiss on success', status: 'planned' },
      { name: 'TxHistoryList', description: 'List of transactions with type, amount, status badge, timestamp, explorer link', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - DeFi',
    components: [
      { name: 'SwapCard', description: 'Complete swap UI: two TokenInputs, swap direction button, rate display, slippage settings, route preview, details accordion', status: 'planned' },
      { name: 'StakeCard', description: 'Stake/Unstake tabs, amount input, APY display, lock duration selector, rewards summary', status: 'planned' },
      { name: 'LendingMetrics', description: 'Health factor gauge, collateral ratio bar, borrow limit bar, liquidation warning', status: 'planned' },
      { name: 'PositionCard', description: 'User position: value, PnL, earnings, action buttons', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - Perps Trading',
    components: [
      { name: 'TradingInterface', description: 'Full TradingView-style layout: candlestick chart, order book, trade history, positions panel, order form', status: 'planned' },
      { name: 'TradingChart', description: 'TradingView candlestick chart with indicators, drawing tools, timeframe selector, fullscreen', status: 'planned' },
      { name: 'OrderBook', description: 'Live order book with bid/ask depth, spread display, click-to-fill price', status: 'planned' },
      { name: 'OrderForm', description: 'Long/Short tabs, Market/Limit/Stop types, leverage slider, size input, margin display, liquidation price', status: 'planned' },
      { name: 'PositionsTable', description: 'Open positions with entry price, mark price, PnL, liquidation price, close/TP/SL actions', status: 'planned' },
      { name: 'TradeHistory', description: 'Recent trades feed with price, size, side, timestamp', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - Prediction Markets',
    components: [
      { name: 'MarketCard', description: 'Question, Yes/No odds, volume, resolution date, outcome bar, quick bet buttons', status: 'planned' },
      { name: 'BetPanel', description: 'Yes/No selection, amount input, potential payout calculator, shares display, submit', status: 'planned' },
      { name: 'OddsDisplay', description: 'Dynamic odds with implied probability %, price movement indicator', status: 'planned' },
      { name: 'MarketChart', description: 'Price/probability chart over time for market outcomes', status: 'planned' },
      { name: 'PositionsList', description: 'User bets with outcome, shares, avg price, current value, PnL, sell option', status: 'planned' },
      { name: 'ResolutionBanner', description: 'Market status: Open/Pending/Resolved with countdown or final outcome', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - NFT',
    components: [
      { name: 'NFTCard', description: 'Image/media, name, collection, price, rarity badge', status: 'planned' },
      { name: 'NFTDetail', description: 'Full view: media viewer (img/video/audio/3D), attributes grid, history, actions', status: 'planned' },
      { name: 'NFTGrid', description: 'Responsive grid with virtualization, lazy loading, filters', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - Bridge',
    components: [
      { name: 'BridgeCard', description: 'From/To chain selectors, amount input, quote display (fees, time, receive amount), route options', status: 'planned' },
      { name: 'BridgeProgress', description: 'Multi-step tracker: Initiated → Confirming → Bridging → Complete', status: 'planned' },
    ],
  },
  {
    category: 'Web3 - Governance',
    components: [
      { name: 'ProposalCard', description: 'Title, status badge, vote bar (For/Against/Abstain %), quorum progress, deadline', status: 'planned' },
      { name: 'VotePanel', description: 'Voting power display, For/Against/Abstain buttons, delegation option', status: 'planned' },
    ],
  },
  // ==================== AI UI ====================
  {
    category: 'AI - Chat',
    components: [
      { name: 'ChatInterface', description: 'Full chat: message list, input with attachments, conversation sidebar, model selector', status: 'planned' },
      { name: 'ChatMessage', description: 'User/Assistant bubble with avatar, markdown/code rendering, actions (copy, regenerate, edit)', status: 'planned' },
      { name: 'StreamingText', description: 'Typewriter effect with cursor, thinking indicator', status: 'planned' },
    ],
  },
  {
    category: 'AI - Code',
    components: [
      { name: 'CodeBlock', description: 'Syntax highlighted code with language badge, copy button, line numbers, collapsible', status: 'planned' },
      { name: 'CodeDiff', description: 'Side-by-side or inline diff view with additions/deletions highlighted', status: 'planned' },
      { name: 'TerminalOutput', description: 'Monospace output with ANSI color support', status: 'planned' },
    ],
  },
  {
    category: 'AI - Generation',
    components: [
      { name: 'ImageGenerator', description: 'Prompt input, style/size selectors, generation progress, result grid with variations', status: 'planned' },
      { name: 'AudioPlayer', description: 'Waveform visualization, playback controls, speed adjustment, transcript display', status: 'planned' },
    ],
  },
  {
    category: 'AI - Agents',
    components: [
      { name: 'AgentPanel', description: 'Execution status, tool calls list, reasoning steps, source citations', status: 'planned' },
      { name: 'ToolCallCard', description: 'Tool name, parameters, result, execution time', status: 'planned' },
    ],
  },
  // ==================== DATA & DISPLAY ====================
  {
    category: 'Data - Tables',
    components: [
      { name: 'DataTable', description: 'Sortable, filterable, paginated table with column customization, row selection, bulk actions, export', status: 'done' },
      { name: 'VirtualizedList', description: 'Performant scrolling for large datasets with variable row heights', status: 'planned' },
    ],
  },
  {
    category: 'Data - Charts',
    components: [
      { name: 'LineChart', description: 'Time series with multiple datasets, zoom, tooltips, legend', status: 'planned' },
      { name: 'BarChart', description: 'Vertical/horizontal bars, stacked/grouped variants', status: 'planned' },
      { name: 'PieChart', description: 'Pie/donut with labels, legend, interactive segments', status: 'planned' },
      { name: 'CandlestickChart', description: 'OHLC with volume, zoom, crosshair', status: 'planned' },
      { name: 'Sparkline', description: 'Inline mini chart for tables/stats', status: 'planned' },
    ],
  },
  {
    category: 'Data - Stats',
    components: [
      { name: 'StatCard', description: 'Value, label, trend arrow with %, optional sparkline', status: 'planned' },
      { name: 'ProgressGauge', description: 'Circular or linear progress with value, label, color zones', status: 'planned' },
    ],
  },
  // ==================== FORMS ====================
  {
    category: 'Forms - Inputs',
    components: [
      { name: 'Input', description: 'Text input with label, error, helper text, prefix/suffix icons', status: 'done' },
      { name: 'Textarea', description: 'Multi-line with auto-resize, character counter', status: 'done' },
      { name: 'Select', description: 'Single select with search, groups, custom rendering', status: 'done' },
      { name: 'MultiSelect', description: 'Multi-select with tags, search, select all', status: 'planned' },
      { name: 'DatePicker', description: 'Single date, range, time picker variants', status: 'planned' },
      { name: 'FileUpload', description: 'Drag-drop zone, file list, progress, preview', status: 'planned' },
      { name: 'RichTextEditor', description: 'WYSIWYG with toolbar, markdown mode toggle', status: 'planned' },
      { name: 'OTPInput', description: 'PIN/code input with auto-focus, paste support', status: 'planned' },
    ],
  },
  {
    category: 'Forms - Controls',
    components: [
      { name: 'Checkbox', description: 'Checkbox with label, indeterminate state', status: 'done' },
      { name: 'RadioGroup', description: 'Radio buttons with descriptions, horizontal/vertical', status: 'done' },
      { name: 'Switch', description: 'Toggle with label, loading state', status: 'done' },
      { name: 'Slider', description: 'Range slider with marks, tooltip, range selection', status: 'done' },
    ],
  },
  {
    category: 'Forms - Structure',
    components: [
      { name: 'Form', description: 'Form wrapper with validation, error summary, submit handling', status: 'done' },
      { name: 'MultiStepForm', description: 'Phased form with step indicator, navigation (next/prev), validation per phase, progress bar, summary step', status: 'planned' },
      { name: 'MultiStepFormDialog', description: 'Dialog version: modal with phased form, step indicator in header, close confirmation if dirty', status: 'planned' },
      { name: 'FieldArray', description: 'Dynamic add/remove fields with reordering', status: 'planned' },
    ],
  },
  // ==================== NAVIGATION ====================
  {
    category: 'Navigation',
    components: [
      { name: 'Navbar', description: 'Top bar with logo, nav links, actions area (responsive with mobile menu)', status: 'planned' },
      { name: 'Sidebar', description: 'Collapsible side nav with groups, icons, nested items, badges', status: 'planned' },
      { name: 'Tabs', description: 'Horizontal/vertical tabs with icons, badges, lazy loading', status: 'done' },
      { name: 'Breadcrumbs', description: 'Path navigation with truncation, dropdown for long paths', status: 'planned' },
      { name: 'Pagination', description: 'Page controls with size selector, total count, jump to page', status: 'planned' },
      { name: 'CommandPalette', description: 'Cmd+K searchable command menu with categories, shortcuts', status: 'planned' },
    ],
  },
  // ==================== FEEDBACK ====================
  {
    category: 'Feedback',
    components: [
      { name: 'Toast', description: 'Notification with variants (success/error/warning/info), action button, dismiss', status: 'done' },
      { name: 'Alert', description: 'Inline message with icon, title, description, dismiss', status: 'done' },
      { name: 'Dialog', description: 'Modal with header, body, footer, sizes, scroll behavior', status: 'done' },
      { name: 'Sheet', description: 'Slide-out panel from any edge', status: 'done' },
      { name: 'Popover', description: 'Floating content anchored to trigger element', status: 'done' },
      { name: 'Tooltip', description: 'Hover hint with arrow, placement options', status: 'done' },
      { name: 'Skeleton', description: 'Loading placeholder matching content shape', status: 'done' },
      { name: 'Progress', description: 'Linear/circular progress with indeterminate mode', status: 'done' },
    ],
  },
  // ==================== LAYOUT ====================
  {
    category: 'Layout',
    components: [
      { name: 'Card', description: 'Container with header, body, footer, variants', status: 'done' },
      { name: 'Accordion', description: 'Collapsible sections, single/multi expand modes', status: 'done' },
      { name: 'ScrollArea', description: 'Custom scrollbar with fade edges', status: 'done' },
      { name: 'ResizablePanels', description: 'Draggable resize handles between panels', status: 'done' },
      { name: 'Carousel', description: 'Sliding content with dots, arrows, autoplay', status: 'done' },
      { name: 'Masonry', description: 'Pinterest-style grid layout', status: 'planned' },
    ],
  },
  // ==================== DISPLAY ====================
  {
    category: 'Display',
    components: [
      { name: 'Avatar', description: 'Image with fallback initials/icon, sizes, status dot', status: 'done' },
      { name: 'Badge', description: 'Label with color variants, icon, removable', status: 'done' },
      { name: 'Tag', description: 'Removable pill with close button', status: 'planned' },
      { name: 'Timestamp', description: 'Relative (2h ago) or absolute time with tooltip', status: 'planned' },
      { name: 'CopyButton', description: 'Click to copy with success feedback', status: 'planned' },
      { name: 'QRCode', description: 'Generate QR from string with download option', status: 'planned' },
      { name: 'EmptyState', description: 'Illustration, title, description, action button', status: 'planned' },
      { name: 'ErrorState', description: 'Error display with retry button', status: 'planned' },
    ],
  },
  // ==================== ACTIONS ====================
  {
    category: 'Actions',
    components: [
      { name: 'Button', description: 'Variants (solid/outline/ghost), sizes, loading state, icon support', status: 'done' },
      { name: 'DropdownMenu', description: 'Menu with items, groups, sub-menus, shortcuts, icons', status: 'done' },
      { name: 'ContextMenu', description: 'Right-click menu', status: 'done' },
      { name: 'ActionBar', description: 'Floating toolbar for selected items with actions', status: 'planned' },
    ],
  },
  // ==================== AUTH ====================
  {
    category: 'Auth',
    components: [
      { name: 'AuthCard', description: 'Login/signup form with social buttons, forgot password link, terms', status: 'planned' },
      { name: 'UserMenu', description: 'Avatar dropdown with profile link, settings, logout', status: 'planned' },
    ],
  },
  // ==================== COMMERCE ====================
  {
    category: 'Commerce',
    components: [
      { name: 'ProductCard', description: 'Image, title, price, rating, add to cart/wishlist', status: 'planned' },
      { name: 'CartDrawer', description: 'Slide-out cart with items, quantity controls, totals, checkout', status: 'planned' },
      { name: 'CheckoutForm', description: 'Multi-step: shipping, payment, review with order summary', status: 'planned' },
      { name: 'PricingTable', description: 'Plan comparison with features, highlighted plan, CTA', status: 'planned' },
    ],
  },
  // ==================== 3D & INTERACTIVE ====================
  {
    category: '3D & Interactive',
    components: [
      { name: 'InteractiveGlobe', description: '3D globe with rotation, zoom, click-to-select locations, markers, arcs between points, tooltip on hover', status: 'planned' },
      { name: 'GlobeMarker', description: 'Customizable pin/marker on globe with pulse animation, popup content on click', status: 'planned' },
      { name: 'GlobeArc', description: 'Animated arc connecting two points on globe (for transfers, connections)', status: 'planned' },
      { name: 'WorldMap', description: '2D interactive map alternative with country selection, heatmap overlay, markers', status: 'planned' },
    ],
  },
]

function StatusBadge({ status }: { status: ComponentStatus }) {
  const config = {
    done: { label: 'Done', icon: Check, className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    'in-progress': { label: 'In Progress', icon: Construction, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    planned: { label: 'Planned', icon: Circle, className: 'bg-muted text-muted-foreground border-border' },
  }[status]

  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export default function UIPage() {
  const totalComponents = componentList.reduce((acc, cat) => acc + cat.components.length, 0)
  const doneCount = componentList.reduce(
    (acc, cat) => acc + cat.components.filter((c) => c.status === 'done').length,
    0
  )
  const inProgressCount = componentList.reduce(
    (acc, cat) => acc + cat.components.filter((c) => c.status === 'in-progress').length,
    0
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">UI Component Library</h1>
          <p className="text-muted-foreground mb-4">
            Consolidated components for Web3, AI, and full-stack products
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{totalComponents}</span>
            </span>
            <span className="text-green-500">
              Done: <span className="font-semibold">{doneCount}</span>
            </span>
            <span className="text-yellow-500">
              In Progress: <span className="font-semibold">{inProgressCount}</span>
            </span>
            <span className="text-muted-foreground">
              Planned: <span className="font-semibold">{totalComponents - doneCount - inProgressCount}</span>
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {componentList.map((category) => (
            <div key={category.category} className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-xl font-semibold">{category.category}</h2>
                <p className="text-sm text-muted-foreground">
                  {category.components.filter((c) => c.status === 'done').length} / {category.components.length} complete
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Component</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px] text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.components.map((component) => (
                    <TableRow key={component.name}>
                      <TableCell className="font-mono text-sm">{component.name}</TableCell>
                      <TableCell className="text-muted-foreground">{component.description}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={component.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
