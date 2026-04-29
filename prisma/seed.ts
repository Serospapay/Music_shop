import { hashSync } from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";

type SpecRow = { label: string; value: string };

type CompatibilityRow = { label: string; detail: string };

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sku: string;
  highlights: string[];
  specs: SpecRow[];
  /** Дублює specs у форматі key/value для поля Prisma technicalSpecs */
  compatibility?: CompatibilityRow[];
  warrantyMonths: number;
  imageUrl: string;
  imageUrls: string[];
  inStock: boolean;
};

type SeedUser = {
  name: string;
  email: string;
  password: string;
};

type SeedReviewSnippet = {
  rating: 4 | 5;
  text: string;
};

const AUTHORIZED_DEMO_USER: SeedUser = {
  name: "авторизований користувач",
  email: "authorized.user@octava.demo",
  password: "AuthorizedUser#2026",
};

function specsToTechnical(specs: SpecRow[]): { key: string; value: string }[] {
  return specs.map((s) => ({ key: s.label, value: s.value }));
}

function stockCountFor(p: SeedProduct): number {
  if (!p.inStock) {
    return 0;
  }
  let h = 0;
  for (let i = 0; i < p.slug.length; i += 1) {
    h = (h + p.slug.charCodeAt(i) * (i + 1)) % 97;
  }
  return 8 + (h % 42);
}

/** Стабільні посилання на конкретні фото Unsplash (через download endpoint). */
const unsplash = (photoId: string) => `https://unsplash.com/photos/${photoId}/download?force=true&w=1200`;

const products: SeedProduct[] = [
  {
    name: "Fender Player Stratocaster HSS",
    slug: "fender-player-stratocaster-hss",
    brand: "Fender",
    sku: "OCT-2024-1001",
    description:
      "Легендарний корпус ольхи, гриф клена з накладкою з пауферу, три звукознімачі Player Series. Універсальний тон для року, фанку та сучасної поп-музики. Заводське налаштування та надійна фурнітура. Ідеальний баланс між класичним синглом біля бріджа та «гарячим» хамбакером для сучасних партій без зайвого шуму.",
    price: 42999,
    category: "Гітари",
    highlights: [
      "Корпус ольхи, гриф клена Modern C",
      "HSS: хамбакер + два сингли Player Series",
      "Тремоло 2-point з віфіга під 9–46",
      "Підходить для року, фанку, попу та блюзу",
    ],
    specs: [
      { label: "Тип", value: "Електрогітара" },
      { label: "Корпус", value: "Ольха" },
      { label: "Гриф", value: "Клен, накладка пауфер" },
      { label: "Мензур", value: '25.5" (648 мм)' },
      { label: "Звукознімачі", value: "Player Series HSS" },
      { label: "Фурнітура", value: "Хром, 2-point tremolo" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("SUR4TbJHTrE"),
    imageUrls: [unsplash("BPnRGuELLe4")],
    inStock: true,
  },
  {
    name: "Gibson Les Paul Standard '50s",
    slug: "gibson-les-paul-standard-50s",
    brand: "Gibson",
    sku: "OCT-2024-1002",
    description:
      "Класичний махагоні з кленовим топом, звукознімачі Burstbucker та пуш-пул. Теплий вінтажний характер з плотним сустейном. Для гітаристів, які шукають автентичний блюзово-роковий голос. Зручний гриф Vintage '50s і традиційна ергономіка, яку впізнають з першого акорду.",
    price: 98900,
    category: "Гітари",
    highlights: [
      "Махагоні + кленовий топ AA",
      "Burstbucker 1 & 2, пуш-пул для coil-split",
      "Гриф Vintage '50s, накладка рожеве дерево",
      "Фірмовий Gibson кейс у комплекті (за умовами постачання)",
    ],
    specs: [
      { label: "Тип", value: "Електрогітара" },
      { label: "Корпус", value: "Махагоні" },
      { label: "Топ", value: "Клен (AA)" },
      { label: "Мензур", value: '24.75" (628 мм)' },
      { label: "Звукознімачі", value: "Burstbucker 1/2" },
      { label: "Брідж", value: "Tune-O-Matic + Stopbar" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("lm2Sa4Em7oo"),
    imageUrls: [unsplash("phkp6WdpnIc")],
    inStock: true,
  },
  {
    name: "Taylor 214ce DLX",
    slug: "taylor-214ce-dlx",
    brand: "Taylor",
    sku: "OCT-2024-1003",
    description:
      "Гранд-аудиторіум з масивною верхньою декою ялини та заднім блоком з палісандру. Вбудований преамп ES2. Чітка артикуляція, збалансовані низи — ідеально для сцени та домашніх записів. Зручний виріз для доступу до верхніх ладів і преміальна обробка периметра корпусу.",
    price: 67500,
    category: "Гітари",
    highlights: [
      "Форма Grand Auditorium — універсальний баланс",
      "Система Taylor ES2 з тюнером",
      "Палісандру на задній декі та боках",
      "Готовність до сцени та студії без додаткового обладнання",
    ],
    specs: [
      { label: "Тип", value: "Акустична гітара з електрикою" },
      { label: "Верх", value: "Ялина (масив)" },
      { label: "Задник/боки", value: "Палісандру шарування" },
      { label: "Гриф", value: "Клен, накладка ебоніт" },
      { label: "Преамп", value: "Taylor ES2" },
      { label: "Кейс", value: "Жорсткий / полужорсткий (залежно від партії)" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("8RVAHTAuC04"),
    imageUrls: [unsplash("5Xdk4gW5e1Q")],
    inStock: true,
  },
  {
    name: "Ibanez RG550 Genesis",
    slug: "ibanez-rg550-genesis",
    brand: "Ibanez",
    sku: "OCT-2024-1004",
    description:
      "Повернення культової моделі з басовим грифом та флойд роуз. Три сингли V7/S1/V8, 24 лади. Для швидких пасажів і агресивного металу з чистою інтонацією. Тонкий гриф Wizard та стабільна робота тремоло під навантаженням сценічного гейну.",
    price: 31800,
    category: "Гітари",
    highlights: [
      "Wizard гриф — швидка гра без втоми",
      "Floyd Rose для стабільного строю",
      "Класична конфігурація V7/S1/V8",
      "Орієнтовано на метал, прог і shred",
    ],
    specs: [
      { label: "Тип", value: "Електрогітара" },
      { label: "Корпус", value: "Бас / липа (серія)" },
      { label: "Гриф", value: "Клен Wizard, 24 лади" },
      { label: "Мензур", value: '25.5"' },
      { label: "Тремоло", value: "Floyd Rose (серія)" },
      { label: "Звукознімачі", value: "HSH V7/S1/V8" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("6pZwlZ0ff6s"),
    imageUrls: [unsplash("lm2Sa4Em7oo")],
    inStock: true,
  },
  {
    name: "Music Man StingRay 4 HH",
    slug: "music-man-stingray-4-hh",
    brand: "Music Man",
    sku: "OCT-2024-1005",
    description:
      "Активна бас-гітара з двома хамбакерами та 5-смуговим еквалайзером. Корпус ясена, стабільний мензур 34''. Панчевий низ і прозорі верхи для фанку та сучасного року. Ергономічний корпус і фірмова електроніка, яка дозволяє швидко знайти «свій» тон.",
    price: 71500,
    category: "Бас-гітари",
    highlights: [
      "Два хамбакери — густий і гнучкий тон",
      "Активний еквалайзер 3+2 (типова схема StingRay)",
      "Мензур 34'' для стабільного низу",
      "Збірка США / преміум лінія (залежно від партії)",
    ],
    specs: [
      { label: "Тип", value: "4-струнна бас-гітара" },
      { label: "Корпус", value: "Ясен" },
      { label: "Гриф", value: "Клен / палісандру накладка" },
      { label: "Мензур", value: '34"' },
      { label: "Електроніка", value: "Активна, 5-смуговий EQ" },
      { label: "Брідж", value: "Струнодержатель Music Man" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("JI5HQV-78RY"),
    imageUrls: [unsplash("CGQ0IBUVzrc")],
    inStock: true,
  },
  {
    name: "Fender Player Jazz Bass",
    slug: "fender-player-jazz-bass",
    brand: "Fender",
    sku: "OCT-2024-1006",
    description:
      "Два сингли Player Series, тонкий гриф Modern C. Класичний джазовий тімбр з можливістю витягти агресивний серединний різ. Надійна збірка та легка вага. Універсальний інструмент для репетицій, запису та виступів у складі гурту.",
    price: 28900,
    category: "Бас-гітари",
    highlights: [
      "Два сингли Player Series Jazz Bass",
      "Гриф Modern C — швидка навігація",
      "Класичний корпус ольхи / липи (серія)",
      "Зручна вага для довгих сетів",
    ],
    specs: [
      { label: "Тип", value: "4-струнна бас-гітара" },
      { label: "Корпус", value: "Ольха" },
      { label: "Гриф", value: "Клен" },
      { label: "Мензур", value: '34"' },
      { label: "Звукознімачі", value: "Player Series Jazz Bass" },
      { label: "Брідж", value: "4-седловий стандарт Fender" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("dvTUtUnJkoI"),
    imageUrls: [unsplash("PuhOlQw32ho")],
    inStock: true,
  },
  {
    name: "Yamaha P-225",
    slug: "yamaha-p-225",
    brand: "Yamaha",
    sku: "OCT-2024-1007",
    description:
      "Компактне цифрове піаніно з клавіатурою GHC та зразками CFX. Bluetooth, вбудовані ритми та запис. Для квартир і репетицій без компромісу по дотику. Лаконічний корпус і зрозуміла панель керування — швидкий старт для навчання та виступів.",
    price: 35200,
    category: "Клавішні",
    highlights: [
      "Клавіатура GHC з матовими клавішами",
      "Тон-генератор CFX Concert Grand",
      "Bluetooth для плеєра та MIDI",
      "Легка вага для транспортування в межах міста",
    ],
    specs: [
      { label: "Тип", value: "Цифрове піаніно" },
      { label: "Клавіші", value: "88, GHC" },
      { label: "Поліфонія", value: "За специфікацією серії (висока)" },
      { label: "Акустика", value: "Вбудовані динаміки" },
      { label: "Підключення", value: "USB, Bluetooth, педалі" },
      { label: "Живлення", value: "Мережевий адаптер (у комплекті)" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("Ly7MLdjJXQc"),
    imageUrls: [unsplash("4W7HePnz7yg")],
    inStock: true,
  },
  {
    name: "Nord Stage 4 Compact",
    slug: "nord-stage-4-compact",
    brand: "Nord",
    sku: "OCT-2024-1008",
    description:
      "Флагман сценічних клавіш: піаніно, орган, синтезатор у одному корпусі. Панель Live Mode, Seamless Transitions, розширена бібліотека. Для професійних туру та студій. Миттєве перемикання програм без обриву звуку та зручний доступ до шарів.",
    price: 118900,
    category: "Клавішні",
    highlights: [
      "Три звукові двигуни: Piano / Synth / Organ",
      "Seamless Transitions між програмами",
      "Розширені ефекти та ротар для органу",
      "Компактний форм-фактор для сцени",
    ],
    specs: [
      { label: "Тип", value: "Сценічна клавіатура" },
      { label: "Клавіші", value: "Семи-восьма (Compact)" },
      { label: "Шари", value: "Кілька незалежних шарів" },
      { label: "Ефекти", value: "Вбудований блок ефектів Nord" },
      { label: "Підключення", value: "MIDI, USB, аудіо виходи" },
      { label: "Живлення", value: "Зовнішній адаптер (у комплекті)" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("5XzAEopFO24"),
    imageUrls: [unsplash("CpCgOckQhRg")],
    inStock: true,
  },
  {
    name: "Roland JD-Xi",
    slug: "roland-jd-xi",
    brand: "Roland",
    sku: "OCT-2024-1009",
    description:
      "Гібрид аналогового синтезу та цифрових PCM-звуків. Вокодер, секвенсор, автоарпеджіо. Компактна станція для електроніки та саунд-дизайну. Ідеально для продакшну бітів, саундтреків та живих виступів у електронних жанрах.",
    price: 18900,
    category: "Клавішні",
    highlights: [
      "Аналоговий бас + цифрові осцилятори",
      "Вокодер та мікрофонний вхід",
      "Секвенсор і арпеджіатор",
      "Компактний корпус для домашньої студії",
    ],
    specs: [
      { label: "Тип", value: "Синтезатор" },
      { label: "Клавіші", value: "Міні-клавіатура" },
      { label: "Синтез", value: "Аналог + PCM" },
      { label: "Секвенсор", value: "4 доріжки (типово)" },
      { label: "Підключення", value: "MIDI/USB, аудіо" },
      { label: "Живлення", value: "Адаптер (у комплекті)" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("NyjJoANsqVw"),
    imageUrls: [unsplash("CpCgOckQhRg")],
    inStock: false,
  },
  {
    name: "Tama Starclassic Performer",
    slug: "tama-starclassic-performer",
    brand: "Tama",
    sku: "OCT-2024-1010",
    description:
      "Набір 22''-10''-12''-16'' з кленово-березовими ободами. Потужний кік, живі томи. Фурнітура з хрому, подвійна нога для педалі. Готовий до концертів і запису. Збалансований тон для року та фанку з чіткою атакою.",
    price: 85600,
    category: "Ударні",
    highlights: [
      "Конфігурація для сцени та студії",
      "Кленово-березові ободи — теплий напад",
      "Хромована фурнітура Starclassic",
      "Готовність до мікрофонування та запису",
    ],
    specs: [
      { label: "Тип", value: "Акустична ударна установка" },
      { label: "Конфігурація", value: "22/10/12/16 (типова)" },
      { label: "Матеріал", value: "Клен / береза (серія)" },
      { label: "Покриття", value: "Залежно від партії" },
      { label: "Фурнітура", value: "Starclassic (хром)" },
      { label: "Комплектація", value: "Раки, кріплення (уточнюйте)" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("KZucO9pcOfM"),
    imageUrls: [unsplash("sU4MnpXKyBQ")],
    inStock: true,
  },
  {
    name: "Zildjian A Custom Cymbal Set",
    slug: "zildjian-a-custom-cymbal-set",
    brand: "Zildjian",
    sku: "OCT-2024-1011",
    description:
      "Комплект тарілок 14'' Hi-Hat, 16'' Crash, 18'' Crash, 20'' Ride. Яскравий сучасний звук з коротким затуханням. Бронза B20, професійна обробка. Універсальний набір для запису та концертів у різних стилях.",
    price: 24600,
    category: "Ударні",
    highlights: [
      "Серія A Custom — яскравий сучасний характер",
      "Комплект для повного базового сету",
      "B20 бронза",
      "Підходить для студії та сцени",
    ],
    specs: [
      { label: "Тип", value: "Комплект тарілок" },
      { label: "Склад", value: "14 HH / 16 Crash / 18 Crash / 20 Ride" },
      { label: "Сплав", value: "B20" },
      { label: "Серія", value: "A Custom" },
      { label: "Обробка", value: "Brilliant (серія)" },
      { label: "Чохол", value: "Опційно / залежить від партії" },
    ],
    warrantyMonths: 12,
    imageUrl: unsplash("sU4MnpXKyBQ"),
    imageUrls: [unsplash("shQesl7x3RA")],
    inStock: true,
  },
  {
    name: "Shure SM7B",
    slug: "shure-sm7b",
    brand: "Shure",
    sku: "OCT-2024-1012",
    description:
      "Динамічний мікрофон для вокалу, подкастів та інструментів. Плоска АЧХ, ефективне придушення шумів та поп-фільтр. Студійний стандарт десятиліть. Стабільна робота з різними преампами та інтерфейсами без зайвого фонового шуму.",
    price: 11200,
    category: "Студія",
    highlights: [
      "Динамічна капсула для близької мови",
      "Вбудовані екрани від наведених наводок",
      "Поп-фільтр та кріплення на стійку",
      "Стандарт для подкастів і вокалу",
    ],
    specs: [
      { label: "Тип", value: "Динамічний мікрофон" },
      { label: "Діаграма", value: "Кардіоїда" },
      { label: "Діапазон", value: "За специфікацією Shure" },
      { label: "Імпеданс", value: "150 Ом (номінально)" },
      { label: "Корпус", value: "Металевий з внутрішніми шумозаглушеннями" },
      { label: "Підключення", value: "XLR" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("PMN6wntEQtQ"),
    imageUrls: [unsplash("PMN6wntEQtQ")],
    inStock: true,
  },
  {
    name: "Universal Audio Volt 476",
    slug: "universal-audio-volt-476",
    brand: "Universal Audio",
    sku: "OCT-2024-1013",
    description:
      "4-канальний USB-аудіоінтерфейс з преампами на основі 610 та компресором на борту. 192 кГц, MIDI I/O. Для домашньої студії з теплим аналоговим кольором. Зручний моніторинг і низька затримка для запису вокалу та інструментів.",
    price: 19800,
    category: "Студія",
    highlights: [
      "4 комбіновані входи XLR/TRS",
      "Компресор Vintage на борту (серія Volt)",
      "MIDI In/Out для клавіш і зовнішніх девайсів",
      "Підтримка високих частот дискретизації",
    ],
    specs: [
      { label: "Тип", value: "USB аудіоінтерфейс" },
      { label: "Канали", value: "4 аналогових входи" },
      { label: "Частота", value: "До 192 кГц" },
      { label: "MIDI", value: "In/Out" },
      { label: "Живлення", value: "USB bus power" },
      { label: "Сумісність", value: "macOS / Windows" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("JMVDrEfp9Q0"),
    imageUrls: [unsplash("JMVDrEfp9Q0")],
    inStock: true,
  },
  {
    name: "Audio-Technica ATH-M50x",
    slug: "audio-technica-ath-m50x",
    brand: "Audio-Technica",
    sku: "OCT-2024-1014",
    description:
      "Закриті навушники з 45 мм драйверами. Зручна посадка для довгих сесій, знімний кабель. Нейтральна сцена для міксу та моніторингу в дорозі. Міцна конструкція та складна конструкція чаш для транспортування.",
    price: 6200,
    category: "Аксесуари",
    highlights: [
      "45 мм драйвери — чітка серединка",
      "Знімний кабель (кілька комплектів у коробці)",
      "Складні чаші для дорожньої сумки",
      "Підходять для міксу та прослуховування",
    ],
    specs: [
      { label: "Тип", value: "Закриті навушники" },
      { label: "Драйвер", value: '45 мм' },
      { label: "Імпеданс", value: "38 Ом (номінально)" },
      { label: "Кабель", value: "Знімний, 3 варіанти довжини" },
      { label: "Роз'єм", value: "2.5 мм (на чаші)" },
      { label: "Вага", value: "~285 г без кабелю" },
    ],
    compatibility: [
      {
        label: "Джерела сигналу",
        detail: "Сумісні з будь-яким джерелом з виходом 3.5 мм або 6.35 мм (через адаптер): інтерфейси, мікшери, плеєри, смартфони з ЦАП.",
      },
      {
        label: "Студія та сцена",
        detail: "Підходять для мобільного міксу, домашньої студії та моніторингу під час репетицій.",
      },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("wUcXPyX56Ug"),
    imageUrls: [unsplash("Hkf0gLvVl4M")],
    inStock: true,
  },
  {
    name: "Boss Katana 100 MKII",
    slug: "boss-katana-100-mkii",
    brand: "Boss",
    sku: "OCT-2024-1015",
    description:
      "Комбопідсилювач 100 Вт з моделюванням п'яти ампів та безліччю ефектів. Power Control для тихої гри, USB-запис. Один прилад для репетицій і сцени. Розширена панель Tone Studio для глибокого редагування пресетів.",
    price: 15400,
    category: "Аксесуари",
    highlights: [
      "5 типів підсилювача + варіації",
      "Вбудовані ефекти та лупер (серія MKII)",
      "Power Control для домашньої гри",
      "USB для запису гітари в DAW",
    ],
    specs: [
      { label: "Тип", value: "Гітарний комбопідсилювач" },
      { label: "Потужність", value: "100 Вт (клас залежить від серії)" },
      { label: "Динамік", value: "12'' (типово)" },
      { label: "Ефекти", value: "Мульти-ефектний блок Boss" },
      { label: "Підключення", value: "USB, AUX, Phones, Footswitch" },
      { label: "Живлення", value: "Мережа 220 В" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("PPE12KFotNs"),
    imageUrls: [unsplash("yoBDElFsC0k")],
    inStock: true,
  },
  {
    name: "Selmer Paris Alto Saxophone Series III",
    slug: "selmer-paris-alto-sax-series-iii",
    brand: "Selmer Paris",
    sku: "OCT-2024-1016",
    description:
      "Професійний альт-саксофон з латуні з позолоченим корпусом. Врівноважена механіка, багатий тембр для джазу та класики. Футляр та аксесуари в комплекті. Інструмент для виконавців, які потребують стабільності інтонації по всьому діапазону.",
    price: 92800,
    category: "Духові",
    highlights: [
      "Професійна лінія Selmer Paris",
      "Серія Series III — широкий діапазон динаміки",
      "Позолочене покриття (серія)",
      "Повна комплектація для старту гри",
    ],
    specs: [
      { label: "Тип", value: "Альт-саксофон" },
      { label: "Матеріал", value: "Латунь" },
      { label: "Покриття", value: "Позолота (серія)" },
      { label: "Мундштук", value: "У комплекті / опційно" },
      { label: "Футляр", value: "Жорсткий кейс" },
      { label: "Ключі", value: "До високого F# (залежно від партії)" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("dBWvUqBoOU8"),
    imageUrls: [unsplash("mI1FkOY_r30")],
    inStock: true,
  },
  {
    name: "Yamaha YTR-8335IIS Trumpet",
    slug: "yamaha-ytr-8335iis-trumpet",
    brand: "Yamaha",
    sku: "OCT-2024-1017",
    description:
      "Професійна труба з легким корпусом та срібним покриттям. Чітка атака, стабільна високий регістр. Обрана оркестровими та студійними музикантами. Зручний вентильний хід і передбачувана інтонація в піанісіно та фортісімо.",
    price: 78900,
    category: "Духові",
    highlights: [
      "Професійна серія Xeno / Custom (лінія)",
      "Срібне покриття — теплий блиск тембру",
      "Стабільність у верхньому регістрі",
      "Футляр та аксесуари Yamaha",
    ],
    specs: [
      { label: "Тип", value: "Труба B♭" },
      { label: "Матеріал", value: "Латунь / срібне покриття" },
      { label: "Калібр", value: "За специфікацією серії" },
      { label: "Вентилі", value: "Монель (серія)" },
      { label: "Мундштук", value: "У комплекті / опційно" },
      { label: "Футляр", value: "Жорсткий кейс" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("y16CTzl1i6g"),
    imageUrls: [unsplash("E8vKoGHANlQ")],
    inStock: true,
  },
  {
    name: "Martin D-28 Modern Deluxe",
    slug: "martin-d-28-modern-deluxe",
    brand: "Martin",
    sku: "OCT-2024-1018",
    description:
      "Дредноут з масивної ялини та палісандру, віфіга з крему. Титанові стержні, бевелед пикгард. Потужний проект для строумена та сольних виступів. Преміальна обробка та фірмовий тембр Martin для акустичних гітаристів-професіоналів.",
    price: 105400,
    category: "Гітари",
    highlights: [
      "Масивна ялина + палісандру — класичний D-28",
      "Стержні з титану для стабільності",
      "Преміум інкрустація та обробка",
      "Жорсткий кейс Martin (за комплектацією партії)",
    ],
    specs: [
      { label: "Тип", value: "Акустична гітара" },
      { label: "Форма", value: "Dreadnought" },
      { label: "Верх", value: "Ялина (масив)" },
      { label: "Задник/боки", value: "Палісандру (масив)" },
      { label: "Гриф", value: "Махагоні, накладка крему" },
      { label: "Брідж", value: "Палісандру, кістяні шпильки" },
    ],
    warrantyMonths: 24,
    imageUrl: unsplash("ZIbrlLp63PY"),
    imageUrls: [unsplash("ZIbrlLp63PY")],
    inStock: true,
  },
];

const reviewUsers: SeedUser[] = [
  AUTHORIZED_DEMO_USER,
  { name: "Олег Кравченко", email: "oleh.kravchenko.reviews@gmail.com", password: "ReviewUser#2026" },
  { name: "Ірина Савченко", email: "iryna.savchenko.reviews@gmail.com", password: "ReviewUser#2026" },
  { name: "Максим Мазур", email: "maksym.mazur.reviews@gmail.com", password: "ReviewUser#2026" },
  { name: "Софія Ткаченко", email: "sofia.tkachenko.reviews@gmail.com", password: "ReviewUser#2026" },
  { name: "Андрій Романюк", email: "andrii.romaniuk.reviews@gmail.com", password: "ReviewUser#2026" },
  { name: "Наталія Петренко", email: "nataliia.petrenko.reviews@gmail.com", password: "ReviewUser#2026" },
  { name: "Денис Гнатюк", email: "denys.hnatiuk.reviews@gmail.com", password: "ReviewUser#2026" },
  { name: "Марія Бондар", email: "mariia.bondar.reviews@gmail.com", password: "ReviewUser#2026" },
];

const reviewSnippetsByCategory: Record<string, SeedReviewSnippet[]> = {
  "Гітари": [
    { rating: 5, text: "Після двох репетицій інструмент тримає стрій стабільно, сустейн довгий. По грифу рука йде легко." },
    { rating: 5, text: "Брав для запису ритм-партій — атака чітка, шумів майже немає. Збірка акуратна, без люфтів." },
    { rating: 4, text: "З коробки все ок, лише трохи підкрутив висоту струн під себе. Для сцени і студії підходить." },
    { rating: 5, text: "Дуже збалансоване звучання між чистим і перевантаженим каналом. В живому міксі не губиться." },
  ],
  "Бас-гітари": [
    { rating: 5, text: "Низ щільний і контрольований, на репетиції в міксі читається без зайвого буста еквалайзером." },
    { rating: 4, text: "Гриф зручний, мензура комфортна. Після базового налаштування інтонація по ладах рівна." },
    { rating: 5, text: "Для фанку і поп-року дуже влучний характер, слеп звучить виразно без перевантаження верхів." },
  ],
  "Клавішні": [
    { rating: 5, text: "Клавіші приємні по відчуттю, динаміка добре передається. Для домашніх занять і виступів — супер." },
    { rating: 4, text: "Сетап зайняв 10 хвилин, усе інтуїтивно. З педаллю і навушниками працює без нарікань." },
    { rating: 5, text: "Тембри ідеально сідають в аранжування, перемикання пресетів швидке навіть під час лайву." },
  ],
  "Ударні": [
    { rating: 5, text: "Набір звучить щільно, томи відкриваються після першого ж налаштування. Для концертів саме те." },
    { rating: 4, text: "Фурнітура міцна, стійки тримають стабільно. На репетиційній базі витримав активну експлуатацію." },
    { rating: 5, text: "Тарілки добре читаються в мікрофонах, атака ясна, без зайвого «піску» у верхньому діапазоні." },
  ],
  "Студія": [
    { rating: 5, text: "Для вокалу і мови результат чистий, рівень шуму низький. У робочому проєкті показав себе відмінно." },
    { rating: 4, text: "Інтерфейс піднявся без проблем, затримка комфортна. Моніторинг стабільний, без артефактів." },
    { rating: 5, text: "Робочий інструмент на кожен день: підключив і працює. Якість матеріалів відчутно вища за бюджетний сегмент." },
  ],
  "Аксесуари": [
    { rating: 5, text: "Щоденне використання без дискомфорту, матеріали приємні. За ці гроші дуже вдалий варіант." },
    { rating: 4, text: "Після кількох сесій все працює стабільно, без несподіваних нюансів. Легко інтегрується в сетап." },
    { rating: 5, text: "Практичний і надійний аксесуар, який реально спрощує роботу на репетиціях і в студії." },
  ],
  "Духові": [
    { rating: 5, text: "Інтонація рівна по всьому діапазону, атака прогнозована. Добре поводиться і в оркестрі, і соло." },
    { rating: 4, text: "Механіка плавна, клапани працюють тихо. Для тривалих занять інструмент комфортний." },
    { rating: 5, text: "Тембр насичений, контроль динаміки зручний. Після прогріву звук стає ще глибшим." },
  ],
};

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickDistinctIndexes(total: number, start: number, count: number): number[] {
  const result: number[] = [];
  let cursor = start;
  while (result.length < count && result.length < total) {
    const index = cursor % total;
    if (!result.includes(index)) {
      result.push(index);
    }
    cursor += 3;
  }
  return result;
}

function databaseNameFromUrl(url: string) {
  try {
    const normalized = url.replace(/^mongodb(\+srv)?:\/\//, "http://");
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/^\//, "").split("?")[0];
    if (path) {
      return path;
    }
  } catch {
    /* ignore */
  }
  return "octave_shop";
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL не задано. Додайте рядок підключення в .env");
  }

  const client = new MongoClient(url);
  await client.connect();

  const db = client.db(databaseNameFromUrl(url));
  const productCollection = db.collection("Product");
  const userCollection = db.collection("User");
  const reviewCollection = db.collection("Review");
  const orderCollection = db.collection("Order");
  const orderItemCollection = db.collection("OrderItem");
  const wishlistCollection = db.collection("WishlistItem");
  const now = new Date();

  for (const p of products) {
    await productCollection.updateOne(
      { slug: p.slug },
      {
        $set: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          category: p.category,
          brand: p.brand,
          sku: p.sku,
          highlights: p.highlights,
          specs: p.specs,
          technicalSpecs: specsToTechnical(p.specs),
          compatibility: p.compatibility ?? [],
          stockCount: stockCountFor(p),
          warrantyMonths: p.warrantyMonths,
          imageUrl: p.imageUrl,
          imageUrls: p.imageUrls,
          inStock: p.inStock,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  for (const seedUser of reviewUsers) {
    await userCollection.updateOne(
      { email: seedUser.email.toLowerCase() },
      {
        $set: {
          name: seedUser.name,
          email: seedUser.email.toLowerCase(),
          passwordHash: hashSync(seedUser.password, 10),
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    );
  }

  const dbUsers = (await userCollection
    .find(
      { email: { $in: reviewUsers.map((u) => u.email.toLowerCase()) } },
      { projection: { _id: 1, email: 1 } },
    )
    .toArray()) as Array<{ _id: ObjectId; email: string }>;
  const usersByEmail = new Map(dbUsers.map((u) => [u.email.toLowerCase(), u._id]));

  const dbProducts = (await productCollection
    .find(
      { slug: { $in: products.map((p) => p.slug) } },
      { projection: { _id: 1, slug: 1, name: 1, category: 1, price: 1 } },
    )
    .toArray()) as Array<{ _id: ObjectId; slug: string; name: string; category: string; price: number }>;

  const authorizedUserId = usersByEmail.get(AUTHORIZED_DEMO_USER.email.toLowerCase());
  if (authorizedUserId && dbProducts.length > 0) {
    const orderSeedTag = "authorized-demo-order-v1";
    const existingDemoOrders = (await orderCollection
      .find({ seedTag: orderSeedTag }, { projection: { _id: 1 } })
      .toArray()) as Array<{ _id: ObjectId }>;
    if (existingDemoOrders.length > 0) {
      await orderItemCollection.deleteMany({ orderId: { $in: existingDemoOrders.map((o) => o._id) } });
      await orderCollection.deleteMany({ _id: { $in: existingDemoOrders.map((o) => o._id) } });
    }

    const totalAmount = dbProducts.reduce((sum, product) => sum + Number(product.price), 0);
    const insertedOrder = await orderCollection.insertOne({
      seedTag: orderSeedTag,
      customerName: AUTHORIZED_DEMO_USER.name,
      email: AUTHORIZED_DEMO_USER.email.toLowerCase(),
      phone: "+380501112233",
      address: "м. Київ, вул. Хрещатик, 22",
      totalAmount,
      status: "PAID",
      userId: authorizedUserId,
      createdAt: now,
      updatedAt: now,
    });

    if (dbProducts.length > 0) {
      await orderItemCollection.insertMany(
        dbProducts.map((product) => ({
          orderId: insertedOrder.insertedId,
          productId: product._id,
          productName: product.name,
          quantity: 1,
          price: Number(product.price),
        })),
      );
    }

    await wishlistCollection.deleteMany({ userId: authorizedUserId });
    await wishlistCollection.insertMany(
      dbProducts.slice(0, 8).map((product, index) => ({
        userId: authorizedUserId,
        productId: product._id,
        createdAt: new Date(now.getTime() - index * 60 * 60 * 1000),
      })),
    );
  }

  let seededReviews = 0;
  for (const product of dbProducts) {
    const snippets = reviewSnippetsByCategory[product.category] ?? reviewSnippetsByCategory["Аксесуари"];
    const baseSeed = hashSeed(product.slug);
    const userIndexes = pickDistinctIndexes(reviewUsers.length, baseSeed, 3);

    for (let i = 0; i < userIndexes.length; i += 1) {
      const user = reviewUsers[userIndexes[i]];
      const userId = usersByEmail.get(user.email.toLowerCase());
      if (!userId) {
        continue;
      }
      const snippet = snippets[(baseSeed + i) % snippets.length];
      const createdAt = new Date(now.getTime() - (5 + ((baseSeed + i * 11) % 160)) * 24 * 60 * 60 * 1000);
      const reviewText = `Користуюсь ${product.name} вже кілька тижнів. ${snippet.text}`;

      await reviewCollection.updateOne(
        { productId: product._id, userId },
        {
          $set: {
            productId: product._id,
            userId,
            rating: snippet.rating,
            text: reviewText,
            status: "APPROVED",
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt,
          },
        },
        { upsert: true },
      );
      seededReviews += 1;
    }
  }

  await client.close();
  console.log(
    `Готово: ${products.length} товарів, ${reviewUsers.length} акаунтів і ${seededReviews} живих відгуків у MongoDB.`,
  );
  console.log(
    `Демо-акаунт: ${AUTHORIZED_DEMO_USER.email} / ${AUTHORIZED_DEMO_USER.password} (ім'я: ${AUTHORIZED_DEMO_USER.name})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
