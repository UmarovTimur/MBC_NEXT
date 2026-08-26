import * as migration_20260627_104107 from './20260627_104107';
import * as migration_20260813_235525_bible_verses from './20260813_235525_bible_verses';
import * as migration_20260814_032954_remove_uz_locale from './20260814_032954_remove_uz_locale';
import * as migration_20260814_035621_drop_verse_label from './20260814_035621_drop_verse_label';
import * as migration_20260820_074326_bible_verses_trgm from './20260820_074326_bible_verses_trgm';
import * as migration_20260820_090000_bible_words from './20260820_090000_bible_words';
import * as migration_20260825_192218_content_reports from './20260825_192218_content_reports';

export const migrations = [
  {
    up: migration_20260627_104107.up,
    down: migration_20260627_104107.down,
    name: '20260627_104107',
  },
  {
    up: migration_20260813_235525_bible_verses.up,
    down: migration_20260813_235525_bible_verses.down,
    name: '20260813_235525_bible_verses',
  },
  {
    up: migration_20260814_032954_remove_uz_locale.up,
    down: migration_20260814_032954_remove_uz_locale.down,
    name: '20260814_032954_remove_uz_locale',
  },
  {
    up: migration_20260814_035621_drop_verse_label.up,
    down: migration_20260814_035621_drop_verse_label.down,
    name: '20260814_035621_drop_verse_label',
  },
  {
    up: migration_20260820_074326_bible_verses_trgm.up,
    down: migration_20260820_074326_bible_verses_trgm.down,
    name: '20260820_074326_bible_verses_trgm',
  },
  {
    up: migration_20260820_090000_bible_words.up,
    down: migration_20260820_090000_bible_words.down,
    name: '20260820_090000_bible_words',
  },
  {
    up: migration_20260825_192218_content_reports.up,
    down: migration_20260825_192218_content_reports.down,
    name: '20260825_192218_content_reports'
  },
];
