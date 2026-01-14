# Strategy Mode

Activate the `strategy` skill to enter strategic planning mode.

**Usage:**
- `/strategy` - Enter strategy mode, then describe your goal
- `/strategy <goal>` - Enter strategy mode with goal in single message

**What this does:**
- Enters NO-CODE planning mode
- Analyzes your goal and breaks it into executable prompts
- Writes prompts to `prompts/` directory for other sessions to execute
- Tracks progress as you report prompt completions

**Example:**
```
/strategy Add cross-chain license purchasing with Hyperlane
```

This generates prompts like:
- `prompts/1.md` - Contract updates
- `prompts/2.md` - Deployment
- `prompts/3.md` - Frontend integration
- etc.

Then run prompts in fresh Claude sessions: "run prompt 1"
