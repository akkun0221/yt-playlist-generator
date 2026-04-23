import type { Genre } from '@/types';

export const SONGS_PER_GENRE = 5;

export const GENRES: Genre[] = [
  {
    id: 'nightcore',
    name: 'NightCore',
    searchQueries: [
      'nightcore best songs',
      'nightcore anime songs',
      'nightcore mix 2024',
      'ナイトコア アニソン',
      'nightcore popular',
    ],
    allowJapanese: true,
  },
  {
    id: 'thrash-metal',
    name: 'スラッシュメタル',
    searchQueries: [
      'thrash metal classic songs',
      'best thrash metal tracks',
      'thrash metal anthems',
    ],
    allowJapanese: false,
  },
  {
    id: 'symphonic-metal',
    name: 'シンフォニックメタル',
    searchQueries: [
      'symphonic metal best songs',
      'symphonic metal epic',
      'symphonic metal female vocals',
    ],
    allowJapanese: false,
  },
  {
    id: 'progressive-metal',
    name: 'プログレッシヴメタル',
    searchQueries: [
      'progressive metal best songs',
      'prog metal classic',
      'progressive metal masterpiece',
    ],
    allowJapanese: false,
  },
  {
    id: 'hr-hm',
    name: 'HR/HM',
    searchQueries: [
      'hard rock heavy metal classic',
      'heavy metal greatest hits',
      'hard rock anthems',
    ],
    allowJapanese: false,
  },
  {
    id: 'nwobhm',
    name: 'NWOBHM',
    searchQueries: [
      'NWOBHM classic songs',
      'new wave of british heavy metal best',
      'NWOBHM bands',
    ],
    allowJapanese: false,
  },
  {
    id: 'power-metal',
    name: 'パワーメタル',
    searchQueries: [
      'power metal best songs',
      'power metal epic anthems',
      'power metal fast songs',
    ],
    allowJapanese: false,
  },
  {
    id: 'glam-metal',
    name: 'グラムメタル',
    searchQueries: [
      'glam metal best songs',
      'hair metal classic hits',
      'glam metal 80s',
    ],
    allowJapanese: false,
  },
  {
    id: 'death-metal',
    name: 'デスメタル',
    searchQueries: [
      'death metal classic songs',
      'best death metal tracks',
      'death metal essential',
    ],
    allowJapanese: false,
  },
  {
    id: 'melodic-death-metal',
    name: 'メロディックデスメタル',
    searchQueries: [
      'melodic death metal best songs',
      'melodeath classic tracks',
      'melodic death metal essential',
    ],
    allowJapanese: false,
  },
  {
    id: 'groove-metal',
    name: 'グルーヴメタル',
    searchQueries: [
      'groove metal best songs',
      'groove metal heavy tracks',
      'groove metal classic',
    ],
    allowJapanese: false,
  },
  {
    id: 'industrial-metal',
    name: 'インダストリアルメタル',
    searchQueries: [
      'industrial metal best songs',
      'industrial metal classic',
      'industrial metal heavy',
    ],
    allowJapanese: false,
  },
  {
    id: 'nu-metal',
    name: 'ニューメタル',
    searchQueries: [
      'nu metal best songs',
      'nu metal classic hits',
      'nu metal 2000s',
    ],
    allowJapanese: false,
  },
  {
    id: 'alternative-metal',
    name: 'オルタナティヴメタル',
    searchQueries: [
      'alternative metal best songs',
      'alt metal classic tracks',
      'alternative metal essential',
    ],
    allowJapanese: false,
  },
  {
    id: 'metalcore',
    name: 'メタルコア',
    searchQueries: [
      'metalcore best songs',
      'metalcore classic tracks',
      'metalcore essential songs',
    ],
    allowJapanese: false,
  },
  {
    id: 'deathcore',
    name: 'デスコア',
    searchQueries: [
      'deathcore best songs',
      'deathcore heavy breakdowns',
      'deathcore essential tracks',
    ],
    allowJapanese: false,
  },
  {
    id: 'new-metalcore',
    name: 'ニューメタルコア',
    searchQueries: [
      'modern metalcore best songs 2024',
      'new metalcore bands',
      'metalcore new wave',
    ],
    allowJapanese: false,
  },
  {
    id: 'punk-rock',
    name: 'パンクロック',
    searchQueries: [
      'punk rock best songs',
      'punk rock classic hits',
      'punk rock anthems',
    ],
    allowJapanese: false,
  },
  {
    id: 'hardcore-punk',
    name: 'ハードコアパンク',
    searchQueries: [
      'hardcore punk best songs',
      'hardcore punk classic',
      'hardcore punk essential',
    ],
    allowJapanese: false,
  },
  {
    id: 'grindcore',
    name: 'グラインドコア',
    searchQueries: [
      'grindcore best songs',
      'grindcore classic tracks',
      'grindcore essential',
    ],
    allowJapanese: false,
  },
  {
    id: 'grunge',
    name: 'グランジ',
    searchQueries: [
      'grunge best songs',
      'grunge classic hits 90s',
      'grunge essential tracks',
    ],
    allowJapanese: false,
  },
  {
    id: 'melodic-hardcore',
    name: 'メロディックハードコア',
    searchQueries: [
      'melodic hardcore best songs',
      'melodic hardcore classic',
      'melodic hardcore essential',
    ],
    allowJapanese: false,
  },
  {
    id: 'post-hardcore',
    name: 'ポストハードコア',
    searchQueries: [
      'post hardcore best songs',
      'post hardcore classic tracks',
      'post hardcore essential',
    ],
    allowJapanese: false,
  },
];
