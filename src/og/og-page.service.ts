import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ArtworksRepository } from '../artworks/repositories/artworks.repository';

function getText(obj: unknown, locale = 'pt-Br'): string {
  if (obj == null) return '';
  if (typeof obj === 'string') {
    try {
      const p = JSON.parse(obj) as unknown;
      if (p && typeof p === 'object' && !Array.isArray(p)) {
        return getText(p, locale);
      }
    } catch {
      return obj;
    }
    return obj;
  }
  if (typeof obj !== 'object' || Array.isArray(obj)) return '';
  const rec = obj as Record<string, unknown>;
  const v =
    rec[locale] ?? rec['en'] ?? rec['pt-Br'] ?? Object.values(rec)[0];
  return typeof v === 'string' ? v : '';
}

function plainText(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n/g, ' ')
    .trim();
}

function requestOrigin(req: Request, configured: string): string {
  if (configured) return configured.replace(/\/$/, '');
  const xfProto = req.headers['x-forwarded-proto'];
  const proto =
    typeof xfProto === 'string' ? xfProto.split(',')[0].trim() : 'http';
  const hostRaw = req.headers['x-forwarded-host'] ?? req.headers.host ?? '';
  const host = typeof hostRaw === 'string' ? hostRaw.split(',')[0].trim() : '';
  if (!host) return 'http://localhost';
  const p = proto === 'https' ? 'https' : 'http';
  return `${p}://${host}`;
}

function resolveSpaIndexPath(configured: string): string | undefined {
  if (configured && existsSync(configured)) return configured;
  const candidates = [
    join(process.cwd(), 'vic-portifolio/dist/index.html'),
    join(process.cwd(), '../vic-portifolio/dist/index.html'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return undefined;
}

@Injectable()
export class OgPageService {
  constructor(
    private readonly artworks: ArtworksRepository,
    private readonly config: ConfigService,
  ) {}

  async buildHtml(imageId: string | undefined, req: Request): Promise<string | null> {
    if (!imageId || typeof imageId !== 'string') {
      return null;
    }
    const baseId = imageId.includes('__extra_')
      ? imageId.replace(/__extra_\d+$/, '')
      : imageId;
    const extraMatch = imageId.match(/__extra_(\d+)$/);
    const extraIdx = extraMatch ? parseInt(extraMatch[1], 10) : -1;

    const row = await this.artworks.findById(baseId);
    if (!row) {
      return null;
    }

    const origin = requestOrigin(req, this.config.get<string>('publicOrigin') ?? '');
    let imagePath = row.image_url?.trim() || '/images/digital-art/digital-art-01.png';
    if (extraIdx >= 0 && Array.isArray(row.extra_images)) {
      const ex = row.extra_images[extraIdx];
      if (typeof ex === 'string' && ex.trim()) {
        imagePath = ex.trim();
      }
    }

    const imageUrl =
      imagePath.startsWith('http://') || imagePath.startsWith('https://')
        ? imagePath
        : `${origin}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;

    const title = plainText(getText(row.title));
    const description = plainText(getText(row.description));

    const fullUrl = `${origin}/s/${encodeURIComponent(imageId)}`;

    const siteName = 'Victória Maria — Portfólio';
    const defaultTitle = 'Victória Maria — Portfólio e Currículo';
    const defaultDesc =
      'Portfólio e currículo. Artes Visuais, desenho, pintura, fotografia, arte digital e vídeos.';
    const ogTitle = title ? `${title} — ${siteName}` : defaultTitle;
    const ogDesc = description || defaultDesc;

    const escape = (s: string) =>
      String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

    const indexPath = resolveSpaIndexPath(this.config.get<string>('spaIndexPath') ?? '');
    if (!indexPath) {
      return null;
    }

    let html = readFileSync(indexPath, 'utf-8');
    const ogImageTag = `<meta property="og:image" content="${escape(imageUrl)}" />`;
    const twImageTag = `<meta name="twitter:image" content="${escape(imageUrl)}" />`;

    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(ogTitle)}</title>`)
      .replace(
        /<meta name="description" content="[^"]*"[^>]*>/,
        `<meta name="description" content="${escape(ogDesc)}" />`,
      )
      .replace(
        /<meta property="og:title" content="[^"]*"[^>]*>/,
        `<meta property="og:title" content="${escape(ogTitle)}" />`,
      )
      .replace(
        /<meta property="og:description" content="[^"]*"[^>]*>/,
        `<meta property="og:description" content="${escape(ogDesc)}" />`,
      )
      .replace(/<meta property="og:image" content="[^"]*"[^>]*>/, ogImageTag)
      .replace(
        /<meta property="og:url" content="[^"]*"[^>]*>/,
        `<meta property="og:url" content="${escape(fullUrl)}" />`,
      )
      .replace(
        /<meta name="twitter:title" content="[^"]*"[^>]*>/,
        `<meta name="twitter:title" content="${escape(ogTitle)}" />`,
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*"[^>]*>/,
        `<meta name="twitter:description" content="${escape(ogDesc)}" />`,
      )
      .replace(/<meta name="twitter:image" content="[^"]*"[^>]*>/, twImageTag);

    return html;
  }
}
