import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

// Run when showcase image URLs change. Production builds use committed thumbnails.
const directory = "src/assets/showcase-thumbnails";
mkdirSync(directory, { recursive: true });
const source = readFileSync("src/content/spec/rice.mdx", "utf8");
const urls = [...new Set([...source.matchAll(/\bimage:\s*"(https?:[^"\s]+)"/g)].map((match) => match[1]))];
const manifest = existsSync(`${directory}/manifest.json`)
	? JSON.parse(readFileSync(`${directory}/manifest.json`, "utf8")) : {};
let cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
	while (cursor < urls.length) {
		const url = urls[cursor++];
		const name = createHash("sha256").update(url).digest("hex").slice(0, 12) + ".webp";
		const path = `${directory}/${name}`;
		try {
			if (!existsSync(path)) {
				const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = Buffer.from(await response.arrayBuffer());
				await sharp(data, { page: 0, pages: 1 }).rotate()
					.resize({ width: 640, height: 480, fit: "cover", withoutEnlargement: true })
					.webp({ quality: 78 }).toFile(path);
			}
			manifest[url] = `assets/showcase-thumbnails/${name}`;
		} catch (error) {
			if (/HTTP (404|410)/.test(error.message)) manifest[url] = null;
			console.warn(`Thumbnail unavailable: ${url} (${error.message}); ${manifest[url] === null ? "using placeholder" : "using lazy original"}.`);
		}
	}
}));
const current = Object.fromEntries(urls.filter((url) => Object.hasOwn(manifest, url)).map((url) => [url, manifest[url]]));
writeFileSync(`${directory}/manifest.json`, JSON.stringify(current, null, "\t") + "\n");
console.log(`Prepared ${Object.values(current).filter(Boolean).length} thumbnails; ${Object.values(current).filter((value) => value === null).length} unavailable images use placeholders.`);
