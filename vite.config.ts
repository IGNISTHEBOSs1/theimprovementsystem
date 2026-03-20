import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
}));
```

Click **Commit changes** ✅

---

## File 2 — `package.json` (one line delete)

👉 `github.com/IGNISTHEBOSs1/theimprovementsystem/blob/main/package.json`

Click ✏️ → Find this line and **delete only it**:
```
"lovable-tagger": "^1.1.13",
```

Click **Commit changes** ✅

---

## File 3 — `public/_redirects` (create new)

👉 `github.com/IGNISTHEBOSs1/theimprovementsystem/tree/main/public`

Click **"Add file" → "Create new file"**

- **Name:** `_redirects`
- **Content** (one line only):
```
/* /index.html 200
