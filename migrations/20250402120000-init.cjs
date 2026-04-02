'use strict';

const sql = `
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  artwork_date DATE NOT NULL,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  video_url TEXT,
  group_key TEXT,
  group_display TEXT,
  types JSONB NOT NULL DEFAULT '[]'::jsonb,
  info JSONB,
  resolution JSONB,
  extra_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  extra_descriptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artworks_order ON artworks (order_index);
CREATE INDEX IF NOT EXISTS idx_artworks_artwork_date ON artworks (artwork_date);

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS extra_images JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS extra_descriptions JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE artworks DROP COLUMN IF EXISTS orientation;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_translations (
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('pt-Br', 'en', 'fr', 'it', 'de')),
  name TEXT NOT NULL,
  PRIMARY KEY (category_id, locale)
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category_id, slug)
);

CREATE TABLE IF NOT EXISTS subcategory_translations (
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('pt-Br', 'en', 'fr', 'it', 'de')),
  name TEXT NOT NULL,
  PRIMARY KEY (subcategory_id, locale)
);

CREATE TABLE IF NOT EXISTS artwork_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artwork_categories_art_cat_only
  ON artwork_categories (artwork_id, category_id)
  WHERE subcategory_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_artwork_categories_art_sub
  ON artwork_categories (artwork_id, subcategory_id)
  WHERE subcategory_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_artwork_categories_artwork ON artwork_categories (artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_categories_category ON artwork_categories (category_id);

CREATE TABLE IF NOT EXISTS bio_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL UNIQUE CHECK (locale IN ('pt-Br', 'en', 'fr', 'it', 'de')),
  content TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL UNIQUE CHECK (locale IN ('pt-Br', 'en', 'fr', 'it', 'de')),
  content TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS main_media_bytes INTEGER;

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS caption_medium JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS physical_dimensions JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS extra_titles JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS extra_caption_media JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS extra_physical_dimensions JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS extra_resolutions JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS extra_media_bytes JSONB NOT NULL DEFAULT '[]'::jsonb;
`;

/** @type {import('sequelize').QueryInterface} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(sql);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS artwork_categories CASCADE;
      DROP TABLE IF EXISTS subcategory_translations CASCADE;
      DROP TABLE IF EXISTS subcategories CASCADE;
      DROP TABLE IF EXISTS category_translations CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS bio_entries CASCADE;
      DROP TABLE IF EXISTS curriculum_entries CASCADE;
      DROP TABLE IF EXISTS social_links CASCADE;
      DROP TABLE IF EXISTS artworks CASCADE;
    `);
  },
};
