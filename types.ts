
export interface StoryState {
  status: 'idle' | 'generating_text' | 'generating_media' | 'complete' | 'error';
  originalInput: string;
  generatedTitle: string;
  generatedStory: string;
  imageUrl?: string;
  audioBuffer?: AudioBuffer;
  error?: string;
}

export type VoiceName = 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';

export type Gender = 'male' | 'female';

export interface IdentityProfile {
  id: string;
  name: string;
  gender: Gender; 
  description: string;
  promptInstruction: string;
  icon: string;
}

export interface NarratorProfile {
  id: string;
  name: string;
  description: string;
  maleVoice: VoiceName;   
  femaleVoice: VoiceName; 
  textStylePrompt: string; 
  imageStylePrompt: string;
  iconColor: string;
}

export interface EmotionalTone {
  id: string;
  name: string;
  description: string;
  promptInstruction: string;
  keywords: string[]; // Added keywords for better prompting
  icon: string;
  colorBorder: string; // Tailwind class
  colorBg: string;     // Tailwind class
}

export interface AppSettings {
  geminiApiKey: string;
  useLocalModel: boolean;
  localModelUrl: string; 
  localModelName: string;
}

// ------------------------------------------------------------------
// DATA DEFINITIONS: FOCUSED ON ADULT ROMANCE & EROTICA
// ------------------------------------------------------------------

export const IDENTITIES: IdentityProfile[] = [
  {
    id: 'male_pov',
    name: '男性視角 (Him)',
    gender: 'male',
    description: '透過男性的感官出發。強調視覺衝擊、佔有慾與壓抑的渴望。',
    promptInstruction: '【視角設定】：採用「男性第一人稱」或「男性主觀第三人稱」。描寫重點在於男性的生理衝動、對伴侶的視覺迷戀（曲線、膚色、表情）、以及想觸碰卻又克制的心理拉鋸。用詞可以略帶粗獷、直接，展現雄性荷爾蒙的張力。',
    icon: '🤵'
  },
  {
    id: 'female_pov',
    name: '女性視角 (Her)',
    gender: 'female',
    description: '透過女性的感官出發。強調觸覺、心理流動、被愛與情緒張力。',
    promptInstruction: '【視角設定】：採用「女性第一人稱」或「女性主觀第三人稱」。描寫重點在於細膩的感官接收（對方的體溫、氣息、手指的力度）、內心的悸動與被填滿（物理或心理）的渴望。用詞要唯美、流動，強調身心合一的感受。',
    icon: '💃'
  },
  {
    id: 'gay_male',
    name: '耽美視角 (BL)',
    gender: 'male',
    description: '男性與男性之間的張力。強調力與美的碰撞、禁忌感與深情。',
    promptInstruction: '【視角設定】：耽美/BL 專屬視角。描寫兩個男性身體的碰撞。強調肌肉的線條、汗水的味道、力量的抗衡。在粗暴中藏著深情，在慾望中混雜著兄弟般的默契或敵對的張力。關鍵字：喉結、青筋、低喘、掌控。',
    icon: '🔗'
  },
  {
    id: 'lesbian',
    name: '百合視角 (GL)',
    gender: 'female',
    description: '女性與女性之間的繾綣。強調柔美、氣味、髮絲與靈魂共鳴。',
    promptInstruction: '【視角設定】：百合/GL 專屬視角。描寫女性之間的極致柔情。強調如水般的交融、髮絲的纏繞、特殊的香氣、以及靈魂深處的共振。氛圍是濕潤的、私密的、帶有母性光輝或姐妹般親暱的界線模糊感。',
    icon: '🌺'
  }
];

export const NARRATORS: NarratorProfile[] = [
  {
    id: 'the_lover',
    name: '枕邊私語 (The Lover)',
    description: '親密、呢喃、彷彿就在耳邊。適合現代浪漫與都市愛情。',
    maleVoice: 'Zephyr', // Soft, intimate
    femaleVoice: 'Kore', // Breathy, soft
    iconColor: 'text-pink-400',
    textStylePrompt: `
      【敘事風格】：ASMR / 枕邊情話 / 都市浪漫。
      語氣特徵：極度親密，彷彿敘事者正躺在讀者身邊，嘴唇貼著耳朵低語。
      寫作技巧：大量使用「呼吸感」的標點符號（...、——）。節奏緩慢慵懶。專注於描寫生活化的浪漫細節（如早晨的陽光、沐浴露的味道、剛醒來的聲音）。
    `,
    imageStylePrompt: `Soft focus photography, cinematic close-up, warm skin tones, golden hour lighting, high bokeh, intimate bedroom setting, romantic mood, cozy atmosphere.`
  },
  {
    id: 'the_dominant',
    name: '絕對支配 (The Dominant)',
    description: '強勢、命令、不容拒絕。適合霸道總裁或高張力劇情。',
    maleVoice: 'Fenrir', // Deep, commanding
    femaleVoice: 'Puck', // Sharp, commanding
    iconColor: 'text-red-600',
    textStylePrompt: `
      【敘事風格】：強勢攻佔 / 支配與臣服 (Dom/Sub) / 霸總文學。
      語氣特徵：低沉、不容置疑、帶有危險的侵略性。
      寫作技巧：使用短促有力的命令句。強調「上位者」的視角。描寫權力關係的傾斜、獵物無處可逃的顫抖、以及完全掌控局面的快感。多用強烈的動詞（攫取、命令、穿透、抵死）。
    `,
    imageStylePrompt: `High contrast noir style, dramatic shadows, red and black color palette, luxurious textures (leather, velvet), sharp angles, intense atmosphere, cinematic lighting.`
  },
  {
    id: 'the_aristocrat',
    name: '古典貴族 (The Aristocrat)',
    description: '優雅、含蓄、慢熱。適合宮廷、歷史或西幻羅曼史。',
    maleVoice: 'Charon', // Deep, formal
    femaleVoice: 'Zephyr', // Elegant, composed
    iconColor: 'text-purple-400',
    textStylePrompt: `
      【敘事風格】：古典西幻 / 宮廷羅曼史 / 歷史向。
      語氣特徵：優雅、詠嘆調般的長句、使用敬語但隱含深意。
      寫作技巧：使用華麗繁複的辭藻與古典隱喻（如：如絲絨般的夜、燃燒的荊棘）。對於情慾的描寫要「含蓄而糜爛」，強調層層包裹下的肌膚之親，以及禮教束縛下的瘋狂。
    `,
    imageStylePrompt: `Oil painting style, Rococo or Baroque art influence, lavish costumes, intricate jewelry, soft candlelight, rich colors (gold, deep purple, emerald), romantic palace setting.`
  },
  {
    id: 'the_tempter',
    name: '危險誘惑 (The Tempter)',
    description: '挑逗、玩世不恭、欲擒故縱。適合歡喜冤家或推拉劇情。',
    maleVoice: 'Puck', // Playful, energetic
    femaleVoice: 'Puck', // Playful
    iconColor: 'text-fuchsia-500',
    textStylePrompt: `
      【敘事風格】：成人喜劇 / 挑逗高手 / 壞壞惹人愛。
      語氣特徵：輕快、帶著笑意、充滿雙關語與性暗示 (Innuendo)。
      寫作技巧：強調言語上的交鋒（Banter）與調情。氛圍是輕鬆但充滿性張力的。描寫眼神的流轉、嘴角的壞笑、以及欲擒故縱的推拉手段。
    `,
    imageStylePrompt: `Fashion photography style, vibrant neon colors, chic and modern, city nightlife background, stylish, seductive, playful atmosphere.`
  }
];

export const EMOTIONS: EmotionalTone[] = [
  {
    id: 'sweet',
    name: '甜寵 / 純愛 (Sweet)',
    description: '無條件的寵溺與溫暖，充滿粉紅泡泡。',
    promptInstruction: '【情緒基調：極致甜寵】。核心是「安全感」。請放慢動作，描寫溫柔的撫摸、額頭的親吻、手指穿過髮絲的觸感。將性愛描寫為一種神聖的、確認彼此心意的儀式，而非單純的發洩。',
    keywords: ['溫柔', '寵溺', '心跳', '暖流', '依賴', '融化'],
    icon: '🍬',
    colorBorder: 'border-pink-300',
    colorBg: 'bg-pink-400/20'
  },
  {
    id: 'lust',
    name: '激情 / 慾望 (Lust)',
    description: '高熱度的感官描寫，強調肉體與本能的吸引。',
    promptInstruction: '【情緒基調：乾柴烈火】。核心是「飢渴」。請使用高溫度的詞彙（灼燒、滾燙、汗濕）。描寫理智線斷裂的瞬間、急促且混亂的呼吸、皮膚摩擦的阻力。強調無法克制的本能衝動，動作要快、狠、準。',
    keywords: ['滾燙', '渴望', '汗水', '顫抖', '衝動', '吞噬'],
    icon: '🔥',
    colorBorder: 'border-red-500',
    colorBg: 'bg-red-600/20'
  },
  {
    id: 'angst',
    name: '虐戀 / 苦澀 (Angst)',
    description: '愛而不得或互相折磨，痛並快樂著。',
    promptInstruction: '【情緒基調：虐心深情】。核心是「痛感」。請描寫身體結合時，心理卻感到孤獨或絕望的反差。使用冷色調的詞彙（冰涼、刺痛、淚水、窒息）。強調「這可能是最後一次」或「明知不可為而為之」的悲劇張力。',
    keywords: ['心碎', '窒息', '淚痕', '冰冷', '絕望', '糾纏'],
    icon: '🥀',
    colorBorder: 'border-blue-400',
    colorBg: 'bg-blue-500/20'
  },
  {
    id: 'taboo',
    name: '禁忌 / 背德 (Taboo)',
    description: '遊走在道德邊緣的刺激，偷情的快感。',
    promptInstruction: '【情緒基調：背德禁忌】。核心是「緊張感」。重點在於環境的壓迫（如：隔壁有人、辦公室、公共場所的角落）與心理的罪惡感。描述要強調「壓抑的聲音」、「害怕被發現的顫抖」以及「越界後的異常興奮」。',
    keywords: ['偷情', '壓抑', '緊張', '罪惡感', '刺激', '越界'],
    icon: '🤫',
    colorBorder: 'border-violet-500',
    colorBg: 'bg-violet-600/20'
  },
  {
    id: 'obsession',
    name: '佔有 / 病嬌 (Obsession)',
    description: '強烈到令人窒息的愛，絕對的控制與被控制。',
    promptInstruction: '【情緒基調：病態佔有】。核心是「囚禁（物理或心理）」。描寫極度黏膩的視線、無法掙脫的擁抱。使用帶有攻擊性或束縛感的詞彙（鎖住、烙印、指痕、窒息）。愛已經扭曲成一種要把對方揉進骨血裡的執念。',
    keywords: ['獨佔', '鎖鏈', '瘋狂', '窒息', '烙印', '監禁'],
    icon: '⛓️',
    colorBorder: 'border-slate-500',
    colorBg: 'bg-slate-600/40'
  },
  {
    id: 'afterglow',
    name: '餘韻 / 溫存 (Afterglow)',
    description: '激情過後的平靜與深情，靈魂的交融。',
    promptInstruction: '【情緒基調：事後溫存】。核心是「慵懶」。請描寫風暴過後的寧靜。重點在於散落的衣物、混亂的床單、皮膚上漸漸退去的潮紅、以及兩人之間的喃喃細語。這是一種靈魂歸位、極度放鬆的親密時刻。',
    keywords: ['慵懶', '餘溫', '寧靜', '依偎', '微光', '呢喃'],
    icon: '🌙',
    colorBorder: 'border-indigo-300',
    colorBg: 'bg-indigo-400/20'
  }
];
