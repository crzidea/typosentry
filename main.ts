import { readFile } from "fs/promises";
import "dotenv/config";
import OpenAI from "openai";
import { env } from "process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { diff } from "./diff.ts";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: env.OPENAI_BASE_URL,
});

if (!env.OPENAI_MODEL) {
  throw new Error("OPENAI_MODEL is not set");
}

let content = "";

const getStdin = async () => {
  return new Promise<string>((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
};
// Parse named argument --file or -f for input file path
let inputFilePath: string | undefined = undefined;
let showDiff: boolean = false;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--file" || process.argv[i] === "-f") {
    inputFilePath = process.argv[i + 1];
    break;
  }
  if (process.argv[i] === "--diff" || process.argv[i] === "-d") {
    showDiff = true;
  }
}

if (inputFilePath) {
  content = await readFile(inputFilePath, "utf-8");
} else {
  content = (await getStdin()).trim();
}

// Read the system prompt from the Markdown file synchronously
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgDir = __dirname;
const systemPrompt = await readFile(
  join(pkgDir, "prompts/system-prompt.md"),
  "utf-8"
);

// Use chat completions
const chatCompletion = await openai.chat.completions.create({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content }
  ],
  model: env.OPENAI_MODEL,
});

if (showDiff) {
  console.log(diff(content, chatCompletion.choices[0].message.content!));
} else {
  console.log(chatCompletion.choices[0].message.content);
}