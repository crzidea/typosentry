## Typosentry — Copy‑editing CLI (OpenAI)

A tiny command‑line tool that sends text to OpenAI with a strict copy‑editing system prompt and prints the corrected text.

The default `system-prompt.md` makes the assistant act as a careful copy editor for Chinese and English, focusing on punctuation, spacing, capitalization, and obvious errors without changing meaning or style.

### Features

- **Input sources**: read from stdin (pipe) or a text file via `--file`/`-f`.
- **Deterministic role**: loads the editing rules from `system-prompt.md`.
- **Config via env**: API key, base URL, and model from environment variables.
- **Optional diff output**: show character-level diffs with `--diff`/`-d`.

### Requirements

- Node.js 18+ (recommended)

### Installation

```bash
git clone https://github.com/your-org/typosentry.git
cd typosentry
npm install
```

### Configuration

Copy the provided template and fill in your values:

```bash
cp template.env .env
# then edit .env
```

Required variables in `.env`:

- `OPENAI_API_KEY`: your key
- `OPENAI_BASE_URL`: optional; set if using a compatible endpoint (e.g., gateway/proxy)
- `OPENAI_MODEL`: e.g., `gpt-4o-mini`, `gpt-4.1-mini`, or another chat‑completion model ID

### Usage

Run the CLI:

```bash
npm start
```

You can provide input in two ways.

1) Pipe stdin:

```bash
echo "i think this is fine , check https://example.com" | npm start
```

On macOS, the most convenient test is using your clipboard via `pbpaste`:

```bash
# Copy any text first (Cmd+C), then run:
pbpaste | npm start

# Optional: write the corrected result back to clipboard
pbpaste | npm start | pbcopy
```

2) From a file:

```bash
npm start -- --file test-prompts.txt
# or
npm start -- -f test-prompts.txt
```

Notes:
- The extra `--` after `npm start` forwards flags to the underlying script.
- Output is printed to stdout with no extra formatting.

#### Diff mode

Use `--diff` (or `-d`) to print a character-level diff between the input and the corrected output. This can be useful when you want to inspect exactly what changed.

```bash
# From stdin
echo "i think this is fine , check https://example.com" | npm start -- --diff

# From a file
npm start -- --file test-prompts.txt --diff
```

Notes:
- The diff is produced with the [`diff`](https://www.npmjs.com/package/diff) package using `diffChars`, and is printed as an array of change objects.
- Each object contains `{ added?: boolean, removed?: boolean, value: string }`.
- You can post-process or pretty-print this structure as needed for your workflow.

Reference implementation used by the CLI:

```ts
// diff.ts
import { diffChars } from 'diff';

export function diff(a: string, b: string) {
  const diff = diffChars(a, b);
  return diff;
}
```

### System prompt

Edit `system-prompt.md` to tweak editing rules. The default prompt:
- Fixes clear errors only; preserves meaning, tone, formatting, and line breaks.
- Keeps URLs, emails, code, file paths, and hashtags/mentions unchanged.
- Includes concise Chinese and English rules and examples.

### Examples

```bash
echo "今天买了3个苹果 、 香蕉 , 和葡萄, 共计 5 %。" | npm start
```

```bash
echo "i think this is fine , but check the link: https://example.com/path" | npm start
```

### Development

- Entrypoint: `main.ts`
- Script: `npm start` runs `tsx main.ts`
- Test data: `test-prompts.txt`

### Troubleshooting

- Error: `OPENAI_MODEL is not set` → define it in `.env`.
- No output returned → verify `OPENAI_API_KEY` and network access; if using a proxy, set `OPENAI_BASE_URL`.
- Model not found → choose a valid chat‑completions model supported by your endpoint.

### License

ISC
