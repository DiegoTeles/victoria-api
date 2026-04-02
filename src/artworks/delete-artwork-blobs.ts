import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { ArtworkBlobRow } from './repositories/artworks.repository.interface';

export function collectArtworkBlobUrls(row: ArtworkBlobRow): string[] {
  const out: string[] = [];
  if (row.image_url) {
    const s = String(row.image_url).trim();
    if (s) out.push(s);
  }
  if (row.video_url) {
    const s = String(row.video_url).trim();
    if (s) out.push(s);
  }
  const ex = row.extra_images;
  if (Array.isArray(ex)) {
    for (const x of ex) {
      const s = typeof x === 'string' ? x.trim() : '';
      if (s) out.push(s);
    }
  }
  return [...new Set(out)];
}

function extractLocalMediaName(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/api\/media\/([^/?#]+)$/);
    return m?.[1] ?? null;
  } catch {
    const m = url.match(/\/api\/media\/([^/?#]+)/);
    return m?.[1] ?? null;
  }
}

export async function deleteLocalMediaFilesFromRow(row: ArtworkBlobRow, uploadAbsDir: string) {
  const urls = collectArtworkBlobUrls(row);
  for (const url of urls) {
    const name = extractLocalMediaName(url);
    if (!name || !/^[0-9a-f-]{36}\.[a-z0-9]{1,12}$/i.test(name)) continue;
    const abs = join(uploadAbsDir, name);
    if (existsSync(abs)) {
      await unlink(abs).catch(() => undefined);
    }
  }
}
