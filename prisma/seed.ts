import { MongoClient } from "mongodb";

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
};

/** Параметри як у next/image — перевірені HEAD-запитами (Unsplash інколи прибирає старі photo-id). */
const unsplash = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;

const products: SeedProduct[] = [
  {
    name: "Fender Player Stratocaster HSS",
    slug: "fender-player-stratocaster-hss",
    description:
      "Легендарний корпус ольхи, гриф клена з накладкою з пауферу, три звукознімачі Player Series. Універсальний тон для року, фанку та сучасної поп-музики. Заводське налаштування та надійна фурнітура.",
    price: 42999,
    category: "Гітари",
    imageUrl: unsplash("1564186763535-ebb21ef5277f"),
    inStock: true,
  },
  {
    name: "Gibson Les Paul Standard '50s",
    slug: "gibson-les-paul-standard-50s",
    description:
      "Класичний махагоні з кленовим топом, звукознімачі Burstbucker та пуш-пул. Теплий вінтажний характер з плотним сустейном. Для гітаристів, які шукають автентичний блюзово-роковий голос.",
    price: 98900,
    category: "Гітари",
    imageUrl: unsplash("1510915361894-db8b60106cb1"),
    inStock: true,
  },
  {
    name: "Taylor 214ce DLX",
    slug: "taylor-214ce-dlx",
    description:
      "Гранд-аудиторіум з масивною верхньою декою ялини та заднім блоком з палісандру. Вбудований преамп ES2. Чітка артикуляція, збалансовані низи — ідеально для сцени та домашніх записів.",
    price: 67500,
    category: "Гітари",
    imageUrl: unsplash("1516280440614-37939bbacd81"),
    inStock: true,
  },
  {
    name: "Ibanez RG550 Genesis",
    slug: "ibanez-rg550-genesis",
    description:
      "Повернення культової моделі з басовим грифом та флойд роуз. Три сингли V7/S1/V8, 24 лади. Для швидких пасажів і агресивного металу з чистою інтонацією.",
    price: 31800,
    category: "Гітари",
    imageUrl: unsplash("1493225457124-a3eb161ffa5f"),
    inStock: true,
  },
  {
    name: "Music Man StingRay 4 HH",
    slug: "music-man-stingray-4-hh",
    description:
      "Активна бас-гітара з двома хамбакерами та 5-смуговим еквалайзером. Корпус ясена, стабільний мензур 34''. Панчевий низ і прозорі верхи для фанку та сучасного року.",
    price: 71500,
    category: "Бас-гітари",
    imageUrl: unsplash("1511671782779-c97d3d27a1d4"),
    inStock: true,
  },
  {
    name: "Fender Player Jazz Bass",
    slug: "fender-player-jazz-bass",
    description:
      "Два сингли Player Series, тонкий гриф Modern C. Класичний джазовий тімбр з можливістю витягти агресивний серединний різ. Надійна збірка та легка вага.",
    price: 28900,
    category: "Бас-гітари",
    imageUrl: unsplash("1508700115892-45ecd05ae2ad"),
    inStock: true,
  },
  {
    name: "Yamaha P-225",
    slug: "yamaha-p-225",
    description:
      "Компактне цифрове піаніно з клавіатурою GHC та зразками CFX. Bluetooth, вбудовані ритми та запис. Для квартир і репетицій без компромісу по дотику.",
    price: 35200,
    category: "Клавішні",
    imageUrl: unsplash("1520523839897-bd0b52f945a0"),
    inStock: true,
  },
  {
    name: "Nord Stage 4 Compact",
    slug: "nord-stage-4-compact",
    description:
      "Флагман сценічних клавіш: піаніно, орган, синтезатор у одному корпусі. Панель Live Mode, Seamless Transitions, розширена бібліотека. Для професійних туру та студій.",
    price: 118900,
    category: "Клавішні",
    imageUrl: unsplash("1571327073757-71d13c24de30"),
    inStock: true,
  },
  {
    name: "Roland JD-Xi",
    slug: "roland-jd-xi",
    description:
      "Гібрид аналогового синтезу та цифрових PCM-звуків. Вокодер, секвенсор, автоарпеджіо. Компактна станція для електроніки та саунд-дизайну.",
    price: 18900,
    category: "Клавішні",
    imageUrl: unsplash("1598488035139-bdbb2231ce04"),
    inStock: false,
  },
  {
    name: "Tama Starclassic Performer",
    slug: "tama-starclassic-performer",
    description:
      "Набір 22''-10''-12''-16'' з кленово-березовими ободами. Потужний кік, живі томи. Фурнітура з хрому, подвійна нога для педалі. Готовий до концертів і запису.",
    price: 85600,
    category: "Ударні",
    imageUrl: unsplash("1514525253161-7a46d19cd819"),
    inStock: true,
  },
  {
    name: "Zildjian A Custom Cymbal Set",
    slug: "zildjian-a-custom-cymbal-set",
    description:
      "Комплект тарілок 14'' Hi-Hat, 16'' Crash, 18'' Crash, 20'' Ride. Яскравий сучасний звук з коротким затуханням. Бронза B20, професійна обробка.",
    price: 24600,
    category: "Ударні",
    imageUrl: unsplash("1485579149621-3123dd979885"),
    inStock: true,
  },
  {
    name: "Shure SM7B",
    slug: "shure-sm7b",
    description:
      "Динамічний мікрофон для вокалу, подкастів та інструментів. Плоска АЧХ, ефективне придушення шумів та поп-фільтр. Студійний стандарт десятиліть.",
    price: 11200,
    category: "Студія",
    imageUrl: unsplash("1590602847861-f357a9332bbc"),
    inStock: true,
  },
  {
    name: "Universal Audio Volt 476",
    slug: "universal-audio-volt-476",
    description:
      "4-канальний USB-аудіоінтерфейс з преампами на основі 610 та компресором на борту. 192 кГц, MIDI I/O. Для домашньої студії з теплим аналоговим кольором.",
    price: 19800,
    category: "Студія",
    imageUrl: unsplash("1598653222000-6b7b7a552625"),
    inStock: true,
  },
  {
    name: "Audio-Technica ATH-M50x",
    slug: "audio-technica-ath-m50x",
    description:
      "Закриті навушники з 45 мм драйверами. Зручна посадка для довгих сесій, знімний кабель. Нейтральна сцена для міксу та моніторингу в дорозі.",
    price: 6200,
    category: "Аксесуари",
    imageUrl: unsplash("1505740420928-5e560c06d30e"),
    inStock: true,
  },
  {
    name: "Boss Katana 100 MKII",
    slug: "boss-katana-100-mkii",
    description:
      "Комбопідсилювач 100 Вт з моделюванням п'яти ампів та безліччю ефектів. Power Control для тихої гри, USB-запис. Один прилад для репетицій і сцени.",
    price: 15400,
    category: "Аксесуари",
    imageUrl: unsplash("1558618666-fcd25c85cd64"),
    inStock: true,
  },
  {
    name: "Selmer Paris Alto Saxophone Series III",
    slug: "selmer-paris-alto-sax-series-iii",
    description:
      "Професійний альт-саксофон з латуні з позолоченим корпусом. Врівноважена механіка, багатий тембр для джазу та класики. Футляр та аксесуари в комплекті.",
    price: 92800,
    category: "Духові",
    imageUrl: unsplash("1470225620780-dba8ba36b745"),
    inStock: true,
  },
  {
    name: "Yamaha YTR-8335IIS Trumpet",
    slug: "yamaha-ytr-8335iis-trumpet",
    description:
      "Професійна труба з легким корпусом та срібним покриттям. Чітка атака, стабільна високий регістр. Обрана оркестровими та студійними музикантами.",
    price: 78900,
    category: "Духові",
    imageUrl: unsplash("1524368535928-5b5e00ddc76b"),
    inStock: true,
  },
  {
    name: "Martin D-28 Modern Deluxe",
    slug: "martin-d-28-modern-deluxe",
    description:
      "Дредноут з масивної ялини та палісандру, віфіга з крему. Титанові стержні, бевелед пикгард. Потужний проект для строумена та сольних виступів.",
    price: 105400,
    category: "Гітари",
    imageUrl: unsplash("1511379938547-c1f69419868d"),
    inStock: true,
  },
];

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
  const collection = db.collection("Product");
  const now = new Date();

  for (const p of products) {
    await collection.updateOne(
      { slug: p.slug },
      {
        $set: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          category: p.category,
          imageUrl: p.imageUrl,
          inStock: p.inStock,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  await client.close();
  console.log(`Готово: ${products.length} товарів у колекції Product (Mongo upsert за slug).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
