#!/usr/bin/env node
/**
 * VP0 Helper Script
 * Search and import real iOS app design starters and AI-readable source pages from VP0.
 * API Base: https://api.vp0.com
 */

const API_BASE = (process.env.VP0_API_URL || "https://api.vp0.com").replace(/\/+$/, "");
const API_KEY = process.env.VP0_API_KEY;
if (!API_KEY) {
  throw new Error("VP0_API_KEY environment variable is not set.");
}

async function request(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "x-api-key": API_KEY,
      "User-Agent": "vp0-client/0.3.0",
    },
  });
  if (!res.ok) {
    throw new Error(`VP0 API returned ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function search(query, limit = 10) {
  const data = await request(`/contents?search=${encodeURIComponent(query)}&limit=${limit}`);
  console.log(`\n🔍 Found ${data.data?.length ?? 0} designs matching "${query}":\n`);
  for (const item of data.data ?? []) {
    console.log(`• [${item.slug}] - ${item.name}`);
    if (item.description) console.log(`  Description: ${item.description}`);
    console.log(`  Import: https://vp0.com/source/${item.slug}\n`);
  }
}

async function getDesign(slug) {
  const manifest = await request(`/r/${encodeURIComponent(slug)}.json`);
  console.log(`\n📱 Design: ${manifest.name ?? slug}`);
  console.log(`• Targets: ${manifest.targets?.join(", ") ?? "N/A"}`);
  console.log(`• Files: ${manifest.files?.length ?? 0} files included`);
  if (manifest.files) {
    for (const f of manifest.files) {
      console.log(`  - ${f.path} (${f.content ? f.content.length : 0} bytes)`);
    }
  }
  if (manifest.installCommand) {
    console.log(`• Install: ${manifest.installCommand}`);
  }
  return manifest;
}

async function listCategories() {
  const categories = await request(`/categories`);
  console.log(`\n📂 VP0 Design Categories (${categories.length}):\n`);
  for (const c of categories) {
    console.log(`• ${c.name} (${c.slug}) - ${c.count} designs`);
  }
}

async function listFlows(limit = 10) {
  const flows = await request(`/contents/feed/flows?limit=${limit}`);
  console.log(`\n🌊 VP0 Multi-Screen App Flows (${flows.data?.length ?? 0}):\n`);
  for (const f of flows.data ?? []) {
    console.log(`• [${f.slug}] - ${f.name} (${f.screen_count ?? 1} screens)`);
  }
}

async function main() {
  const [,, cmd, arg1, arg2] = process.argv;

  switch (cmd) {
    case "search":
      if (!arg1) {
        console.error("Usage: node scripts/vp0.mjs search <keywords> [limit]");
        process.exit(1);
      }
      await search(arg1, arg2 ? parseInt(arg2, 10) : 10);
      break;
    case "get":
      if (!arg1) {
        console.error("Usage: node scripts/vp0.mjs get <slug>");
        process.exit(1);
      }
      await getDesign(arg1);
      break;
    case "categories":
      await listCategories();
      break;
    case "flows":
      await listFlows(arg1 ? parseInt(arg1, 10) : 10);
      break;
    default:
      console.log(`
VP0 iOS Screens & Design Starters Helper
Connected with API Key: ${API_KEY.slice(0, 12)}...

Commands:
  node scripts/vp0.mjs search <query>     Search designs by keyword
  node scripts/vp0.mjs get <slug>          Fetch design manifest and files
  node scripts/vp0.mjs categories          List available design categories
  node scripts/vp0.mjs flows               List multi-screen app flows
      `);
      break;
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
