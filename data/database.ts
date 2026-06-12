
import type { Podcast, Video, Comment, Post, Book, Author, PublishedBook } from '../types';

interface DbData {
  podcasts: Podcast[];
  videos: Video[];
  comments: Comment[];
  posts: Post[];
  books: Book[];
  authors: Author[];
  publishedBooks: PublishedBook[];
}

const correctAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const db: DbData = {
    "authors": [
        { "id": 2, "name": "امیر نجات‌بخش", "avatar": "https://soha-sima.ir/wp-content/uploads/2024/03/%D8%A7%D9%85%DB%8C%D8%B1-%D9%86%D8%AC%D8%AAT-%D8%A8%D8%AE%D8%B4.jpg", "bio": "پژوهشگر حوزه تاریخ فکری و گفتمان پیشرفت.", "role": "secretary" },
        { "id": 5, "name": "اصغر طاهرزاده", "avatar": "https://uploadkon.ir/uploads/024d05_25استاد-طاهرزاده.jpg", "bio": "متفکر و نویسنده در حوزه تمدن نوین اسلامی.", "role": "master" },
        { "id": 8, "name": "محمد قائم‌خانی", "avatar": "https://soha-sima.ir/wp-content/uploads/2024/03/%D9%82%D8%A7%D8%A6%D9%85-%D8%AE%D8%A7%D9%86%DB%8C.jpg", "bio": "نویسنده و پژوهشگر حوزه روایت و ادبیات پایداری.", "role": "master" },
        { "id": 12, "name": "سُها", "avatar": "https://uploadkon.ir/uploads/ce6e18_25sohamedia.png", "bio": "رسانه تخصصی تفکر و اندیشه.", "role": "secretary" }
    ],
    "podcasts": [
        {
          "id": 10,
          "title": "روایت ایران آینده",
          "description": "سلسله جلسات بررسی افق‌های پیشرفت در تاریخ معاصر ایران.",
          "cover": "https://soha-sima.ir/wp-content/uploads/2025/05/photo_2025-05-04_13-51-23.jpg",
          "speakerId": 2,
          "duration": "03:20:00",
          "episodes": [
            { "title": "بخش اول: امکان توسعه بومی", "description": "بررسی نسبت تکنولوژی و فرهنگ ایرانی", "duration": "01:10:00", "audioUrl": correctAudioUrl, "date": "2025-05-20", "isNew": true, "viewCount": 2100, "fullText": "متن کامل تحلیل گفتمان پیشرفت..." },
            { "title": "بخش دوم: بازخوانی تجربه تاریخی", "description": "تجربیات ایران در مواجهه با مدرنیته صنتعی", "duration": "01:10:00", "audioUrl": correctAudioUrl, "date": "2025-05-25", "isNew": true, "viewCount": 1500 }
          ],
          "year": 1404,
          "categories": ["گفتمان پیشرفت"]
        },
        {
          "id": 11,
          "title": "ایستادگی در میانه میدان",
          "description": "تحلیلی بر مبانی فکری مقاومت در منطقه.",
          "cover": "https://uploadkon.ir/uploads/6e5919_25جلد-دو-مقاله.jpg",
          "speakerId": 8,
          "duration": "02:15:00",
          "episodes": [
            { "title": "فلسفه پایداری", "description": "ریشه‌های حکمی مقاومت", "duration": "01:05:00", "audioUrl": correctAudioUrl, "date": "2025-05-22", "isNew": true, "viewCount": 3400 }
          ],
          "year": 1403,
          "categories": ["قصه مقاومت"]
        },
        {
            "id": 12,
            "title": "مدرسه سیاست سُها",
            "description": "دوره فشرده بازخوانی مفاهیم سیاسی از منظر حکمی.",
            "cover": "https://uploadkon.ir/uploads/ce6e18_25sohamedia.png",
            "speakerId": 12,
            "duration": "04:00:00",
            "episodes": [
                { "title": "مفهوم قدرت در حکمت", "description": "نسبت قدرت و حقیقت", "duration": "45:00", "audioUrl": correctAudioUrl, "date": "2025-05-18", "isNew": false, "viewCount": 980 }
            ],
            "year": 1403,
            "categories": ["مدرسه سیاست"]
        }
    ],
    "videos": [
        {
          id: "i467c84",
          embedId: "i467c84",
          title: "بزم عاشقانه",
          description: "غزه,شعر مقاومت,مهدی باکری,احمد کاظمی,وائل دحدوح",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/56123259-9592-l__3352.jpg?width=900&quality=90&secret=C6vBybb5LTAAMFQlcvmHqA",
          viewCount: 293,
          uploadDate: "17 آذر 1402 15:40",
          duration: 691,
          categories: ["مذهبی"],
          likes: 15
        },
        {
          id: "OUMf9",
          embedId: "OUMf9",
          title: "خبرنگار",
          description: "روایتی از شهادت محمدابوحطب خبرنگاری اهل غزه، که توسط اشغالگران به شهادت رسید\n\nای وطن !\nچرا ؟ چقدر  فاصله است بین ما؟\nچرا مرا نمیبرند مثل تو بروی دستها؟\nتن تو زخمی و هنوز سالمم\nوطن اگر که میروی ...\nدرنگ کرد \nو باز گریه کرد\nگلوله میخوری و من ...\nلباس از تنش برون فکند و زد کلاه بر زمین و رفت و آخرش ...",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/56114073-2437-l__6567.jpg?width=900&quality=90&secret=rqOcMnffIFjV6FozIzIgnA",
          viewCount: 149,
          uploadDate: "17 آذر 1402 00:09",
          duration: 539,
          categories: ["مذهبی"],
          likes: 8
        },
        {
          id: "r413om5",
          embedId: "r413om5",
          title: "وعده صادق",
          description: "مقایسه ی محاصره باریکه غزه توسط صهیونیست ها پس از عملیات طوفان الاقصی با محاصره شهر پاوه",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/56110097-3445-l__6036.jpg?width=900&quality=90&secret=CmfDqsmJ18y1lA6gRKY4pg",
          viewCount: 396,
          uploadDate: "16 آذر 1402 19:44",
          duration: 584,
          categories: ["فرهنگ و هنر"],
          likes: 10
        },
        {
          id: "lFjKT",
          embedId: "lFjKT",
          title: "هیهات",
          description: "نماهنگ هیهات(هرگز)\nبرشی کوتاه از علل شرعی و عقلی شروع عملیات طوفان الاقضی",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/56036592-4651-l__4349.jpg?width=900&quality=90&secret=LQRyEpf_j4vw0fp7XaKXXQ",
          viewCount: 151,
          uploadDate: "13 آذر 1402 07:05",
          duration: 543,
          categories: ["فرهنگ و هنر"],
          likes: 2
        },
        {
          id: "g95507e",
          embedId: "g95507e",
          title: "راهی که از سر گرفتیم",
          description: "فلسطین,غزه,نماهنگ,لبنان,سید حسن نصر الله",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/56009028-1124-l__1488.jpg?width=900&quality=90&secret=I08ktwI3KR-PV4h--ANPDg",
          viewCount: 141,
          uploadDate: "11 آذر 1402 16:29",
          duration: 939,
          categories: ["فرهنگ و هنر"],
          likes: 4
        },
        {
          id: "j811h76",
          embedId: "j811h76",
          title: "بهشت خوبان",
          description: "غزه,فلسطین,مقاومت,هوش مصنوعی",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/55533239-8780-l__2058.jpg?width=900&quality=90&secret=JpTciaY7IBWVE7m9Ycb8-w",
          viewCount: 264,
          uploadDate: "11 آبان 1402 17:14",
          duration: 540,
          categories: ["قانون و سیاست"],
          likes: 6
        },
        {
          id: "r654kx7",
          embedId: "r654kx7",
          title: "بشارت صبر",
          description: "فلسطین,مقاومت,غزه,استاد طاهر زاده",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/55520883-5044-l__8531.jpg?width=900&quality=90&secret=byf9Sc0cTKsC_u0dOluhqg",
          viewCount: 236,
          uploadDate: "10 آبان 1402 22:09",
          duration: 511,
          categories: ["قانون و سیاست"],
          likes: 6
        },
        {
          id: "llzsnsx",
          embedId: "llzsnsx",
          title: "خون دلی که لعل شد",
          description: "رهبر شهید انقلاب,خون دلی که لعل شد,انقلاب اسلامی,اربعین حسینی خامنه ای",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/69672725-9704-l__9545.jpg?width=900&quality=90&secret=LWtO7iwzP-GrViSLaOLlAg",
          viewCount: 278,
          uploadDate: "27 فروردین 1405 19:41",
          duration: 608,
          categories: ["قانون و سیاست"],
          likes: 9
        },
        {
          id: "gmr9kpa",
          embedId: "gmr9kpa",
          title: "روایت بعثت",
          description: "شب عاشورایی",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/69003129-6035-l__1839.jpg?width=900&quality=90&secret=bzSwDNuKldKikGLdnS9EYg",
          viewCount: 183,
          uploadDate: "02 فروردین 1405 15:09",
          duration: 1069,
          categories: ["مذهبی"],
          likes: 5
        },
        {
          id: "bazwm00",
          embedId: "bazwm00",
          title: "روایت بعثت  |  قسمت دوم  |  امت صاحب الزمان عج",
          description: "رهبر انقلاب,روایت بعثت,جنگ تحمیلی سوم",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/69294244-6061-l__6712.jpg?width=900&quality=90&secret=Iz2LOOM0_3t_cqxY_3M1-Q",
          viewCount: 36,
          uploadDate: "15 فروردین 1405 15:29",
          duration: 999,
          categories: ["مذهبی"],
          likes: 1
        },
        {
          id: "dvkn088",
          embedId: "dvkn088",
          title: "روایت بعثت   |   چه کسی از جنگ خسته شده است",
          description: "انقلاب اسلامی,بعثت مردم,شهادت رهبری",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/69970523-3121-l__8849.jpg?width=900&quality=90&secret=47DYCk9U0qOhq2OYBjId4w",
          viewCount: 65,
          uploadDate: "05 اردیبهشت 1405 20:59",
          duration: 1045,
          categories: ["قانون و سیاست"],
          likes: 5
        },
        {
          id: "vsxcg4f",
          embedId: "vsxcg4f",
          title: "«سَرای اُمید»",
          description: "سرای امید,شهادت رهبر انقلاب,رهبر شهید,سیدعلی خامنه ای,سها",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/70553663-3752-l__4499.jpg?width=900&quality=90&secret=6GbWhOe-aEcSWPLeo-5QyQ",
          viewCount: 47,
          uploadDate: "21 اردیبهشت 1405 15:01",
          duration: 169,
          categories: ["ویدئو گیم"],
          likes: 1
        },
        {
          id: "ypxo1ts",
          embedId: "ypxo1ts",
          title: "زان که بی شمشیر کشتن کار اوست",
          description: "ما و حضور نرم تمدنی در شهادت رهبر معظم انقلاب",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/68745750-6644-l__1817.jpg?width=900&quality=90&secret=6q3hpPdcdv5q-cHOBMBScA",
          viewCount: 78,
          uploadDate: "18 اسفند 1404 23:10",
          duration: 467,
          categories: ["قانون و سیاست"],
          likes: 1
        },
        {
          id: "yzmr821",
          embedId: "yzmr821",
          title: "برنامه توسعه",
          description: "ما چگونه به آینده میاندیشیم؛ آنچه درک ماست از زندگی در دنیای امروز",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/67208132-3766-l__2627.jpg?width=900&quality=90&secret=AA3RZ9cYxxwBexndmtiVwQ",
          viewCount: 62,
          uploadDate: "07 آذر 1404 16:41",
          duration: 673,
          categories: ["قانون و سیاست"],
          likes: 1
        },
        {
          id: "kmz9oz3",
          embedId: "kmz9oz3",
          title: "منزل",
          description: "جایگاه استقبال از زائر اربعینی",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/66045145-4340-l__9548.jpg?width=900&quality=90&secret=Xkhr7ZzXKpv-t-TXcEbaog",
          viewCount: 64,
          uploadDate: "08 شهریور 1404 19:28",
          duration: 816,
          categories: ["مذهبی"],
          likes: 0
        },
        {
          id: "sdfl08i",
          embedId: "sdfl08i",
          title: "ملت ایران",
          description: "روایتی از حرکت ملت ایران در میانه طوفان...",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/65073478-3551-l__6884.jpg?width=900&quality=90&secret=hW0FYZWAhdOn4QsZU1SpeQ",
          viewCount: 318,
          uploadDate: "06 تیر 1404 11:44",
          duration: 856,
          categories: ["قانون و سیاست"],
          likes: 6
        },
        {
          id: "fvga5g0",
          embedId: "fvga5g0",
          title: "اشاره‌ی فتح",
          description: "ما از مرگ نميترسیم، كه مرگ ما شهادت است و شهادت، حیات عندالرب. عقلهای محجوب به آیینههای قیراندود فطرت بشر غربی چگونه خواهند توانست كه معنای حیات عندالرب را دریابند؟",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/64962629-4673-l__8290.jpg?width=900&quality=90&secret=-o_DMBWLi0VRfVRmKEtePA",
          viewCount: 121,
          uploadDate: "27 خرداد 1404 01:22",
          duration: 246,
          categories: ["قانون و سیاست"],
          likes: 1
        },
        {
          id: "scpr14s",
          embedId: "scpr14s",
          title: "«سالک روح‌الله» روایت سلوک ذیل شخصیت امام خمینی «ره«",
          description: "روایت «سالک روح الله» بیانگر این مسئله است که ما بدون یاد و عهد با امام هیچ میشویم...\nو مانند کالبدی هستیم که روح ندارد\nراوی این روایت رهبر انقلاب هستند که در مناسبت های مختلف به تبین عظمت شخصیت امام خمینی می پردازند.",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/64801936-9681-l__5370.jpg?width=900&quality=90&secret=_CyTmZO79iGb1PrGLg4zbA",
          viewCount: 103,
          uploadDate: "14 خرداد 1404 14:04",
          duration: 1735,
          categories: ["فیلم، سریال و مستند"],
          likes: 1
        },
        {
          id: "irxz764",
          embedId: "irxz764",
          title: "پیمان علم؛ پیمان کربلایی",
          description: "شايد براي آنها كه هنوز نميخواهند حقيقت را باور كنند بين فقه و اصول و جبهههاي جنگ تناسبي نباشد، اما براي ما كه علما و فقها را ورثهي انبيا ميدانيم حقيقت مسلم اين است كه فتح ما در جبهههاي نبرد، در همين كلاسهاي فقه و اصول است كه پايهريزي ميگردد. ما براي اسلام ميجنگيم و درخت تنومند اسلام ريشه در خاك فقه و اصول دارد و از خون عُشاق آبياري ميشود. پيمان علم، پيماني كربلايي است و آن كه اين پيمان را با خدا بست، در مدرسه درس فقه ميخواند و در جبهه درس عشق، و قربتاً الي الله بر سر اين هر دو درس با وضو وارد ميشود و اين هر دو را جبههي مبارزه با كفر و شرك ميداند، و ميداند كه اين راه، راه شهادت است.",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/64427406-5270-l__3012.jpg?width=900&quality=90&secret=urkC0-T50seX_8UeeTAfBg",
          viewCount: 102,
          uploadDate: "17 اردیبهشت 1404 09:24",
          duration: 355,
          categories: ["قانون و سیاست"],
          likes: 2
        },
        {
          id: "gaz3auq",
          embedId: "gaz3auq",
          title: "تماشاگه راز",
          description: "گروه های فیلمبرداری ما با همان انگیزه هایی که رزم آوران را به جبهه کشانده بود کار می کردند؛ داوطلبانه و بدون چشم داشت مالی در کمال قناعت و شجاعت و آماده برای شهادت. این آمادگی اصلی بود که باقی ضرورتها را ایجاب میکرد . یعنی اگر گروه های فیلمبرداری ما آماده برای مرگ نبودند دیگر قناعت و صداقت و دیگر صفات ممدوحشان فایده ای نمی توانست داشته باشد. اینجا عرصه ای نبود که فقط پای تکنیک و یا هنر در میان باشد. بهترین کارگردان های سینما اگر آمادگی برای کشته شدن در جنگ نمی داشتند نمی توانستند در میان ما مفید به فاید و ارجمند باشند. این کارها که ما می کردیم از پول یا بروکراسی یا سیستم ای نظامی و یا هر چیز دیگر بر نمی آمد عشق می خواهد و انگیزش ریشه انگیزش هم در عشق است هر انگیزش.",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/64200075-7115-l__4578.jpg?width=900&quality=90&secret=IEJTnVfQ3U75T4hVWJGywQ",
          viewCount: 313,
          uploadDate: "30 فروردین 1404 20:15",
          duration: 720,
          categories: ["فرهنگ و هنر"],
          likes: 6
        },
        {
          id: "ovcp8c3",
          embedId: "ovcp8c3",
          title: "سرانگشت فاطمی",
          description: "\n آیا خط مقدم را فقط در میدان جنگ نظامی باید جست؟\nخط مقدم آنجاست که خانه را در دهانه آتشفشان بنا میکنیم و از زندگی سرد و خاموش هر روزی که جانمان را فرسوده میکند طمع میبُریم.\nملت ایران با حضور در خط مقدم مبارزه با شیطان بزرگ زندگی را در معنای اصیلش آزمود و مقاومت را به مثابه راه جدیدی برای زندگی در جهان امروز متذکر شد.\nآری از یک طرف علم و فناوری تقدیر جهان امروز است و از طرف دیگر گویا انسان امروز با وعده شیطان زمین گیر جهان مصرف شده است.\n روایتی از شبهای قدر انقلاب اسلامی \n(حضور مردم در سرچشمه های اقتصاد و مسائل کشور)\n#جنگ_اقتصادی \n#شب_های_قدر_انقلاب_اسلامی",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/63709102-8295-l__8130.jpg?width=900&quality=90&secret=KioHzWbfW2aBPE5fdU9oQg",
          viewCount: 357,
          uploadDate: "26 اسفند 1403 18:03",
          duration: 2260,
          categories: ["قانون و سیاست"],
          likes: 10
        },
        {
          id: "gsjx0q1",
          embedId: "gsjx0q1",
          title: "سرِ یحیی",
          description: "یحیی سنوار,رهبر انقلاب,ادبیات مقاومت",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/62476375-1811-l__7903.jpg?width=900&quality=90&secret=4YhoIhAith2t5LTmItoESw",
          viewCount: 175,
          uploadDate: "12 دی 1403 22:53",
          duration: 232,
          categories: ["قانون و سیاست"],
          likes: 5
        },
        {
          id: "tyb705r",
          embedId: "tyb705r",
          title: "اقرا",
          description: "ما با فریاد، محمد رضا خان را بیرونش کردیم. شما خیال میکنید با تفنگ بیرون کردیم؟ با فریاد، با «الله اکبر»! این قدر «الله اکبر» بر مغز اینها کوبیده شد که خودشان را باختند و فرار کردند. از این مملکت رفتن",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/62146061-9277-l__7289.jpg?width=900&quality=90&secret=lhzF1nb0sj-hBxsD-Ao7nQ",
          viewCount: 354,
          uploadDate: "23 آذر 1403 01:33",
          duration: 560,
          categories: ["قانون و سیاست"],
          likes: 6
        },
        {
          id: "kdx2a31",
          embedId: "kdx2a31",
          title: "وعده‌های صادق",
          description: "امام خمینی,رهبر انقلاب,استاد طاهرزاده",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/62083087-2263-l__9586.jpg?width=900&quality=90&secret=kZn2XLJppC1JYCDmB0xS8w",
          viewCount: 199,
          uploadDate: "19 آذر 1403 10:11",
          duration: 752,
          categories: ["قانون و سیاست"],
          likes: 6
        },
        {
          id: "wvbw3s2",
          embedId: "wvbw3s2",
          title: "شهادت رهبر معظم انقلاب",
          description: "حضور فعال انقلاب اسلامی در جهان بشری",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/68623030-4606-l__2587.jpg?width=900&quality=90&secret=X59L-kvgLg_7rV5TCJjSlw",
          viewCount: 1514,
          uploadDate: "10 اسفند 1404 21:13",
          duration: 3471,
          categories: ["قانون و سیاست"],
          likes: 13
        },
        {
          id: "cvh4675",
          embedId: "cvh4675",
          title: "رهبر شهید و خلق معانی جدید در کلام  |  قسمت دوم",
          description: "رهبر شهید,استاد طاهرزاده,رهبر انقلاب",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/70828555-6390-l__3392.jpg?width=900&quality=90&secret=RKQRfxlgOTh5YLjdssbWOA",
          viewCount: 31,
          uploadDate: "28 اردیبهشت 1405 15:41",
          duration: 3219,
          categories: ["قانون و سیاست"],
          likes: 0
        },
        {
          id: "tannb0t",
          embedId: "tannb0t",
          title: "رهبر شهید و خلق معانی جدید در کلام   |  نشست اول",
          description: "استاد طاهرزاده,رهبر شهید انقلاب,سیدالشهدای انقلاب اسلامی",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/70645790-6868-l__9784.jpg?width=900&quality=90&secret=HhcNahxeaJl1mF6UTqFngg",
          viewCount: 122,
          uploadDate: "23 اردیبهشت 1405 19:57",
          duration: 4242,
          categories: ["قانون و سیاست"],
          likes: 1
        },
        {
          id: "sndqam4",
          embedId: "sndqam4",
          title: "رهبر شهید و خلق معانی جدید در کلام  |  قسمت سوم",
          description: "رهبر شهید,انقلاب اسلامی,استاد طاهرزاده",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/71069042-2819-l__9454.jpg?width=900&quality=90&secret=D5_Huc5chlAyRbBUwLbQgQ",
          viewCount: 21,
          uploadDate: "03 خرداد 1405 21:50",
          duration: 3704,
          categories: ["قانون و سیاست"],
          likes: 0
        },
        {
          id: "stc91du",
          embedId: "stc91du",
          title: "سیدابراهیم",
          description: "شهید جمهور,آیت الله رئیسی,انتخابات,ایران امام رضا",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/59216581-8721-l__7322.jpg?width=900&quality=90&secret=95TLx7ONKUNjwmYLi8T_ow",
          viewCount: 431,
          uploadDate: "14 خرداد 1403 23:57",
          duration: 551,
          categories: ["قانون و سیاست"],
          likes: 13
        },
        {
          id: "upkqyeb",
          embedId: "upkqyeb",
          title: "سفیر",
          description: "مردم و رهبر انقلاب شعید رئیسی را به کوفه ی جنگ اقتصادی فرستادند تا از او بیعت بگیرد و کار جنگ را یکسره کند. ما همه خوش گمان بودیم و فکر می کردیم حل مشکلات مردم کاری ندارد ولی ازین کوفه ی بی وفا که سود و زیان ها در میان است بوی بی وفایی می آمد.",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/59414604-2396-l__8765.jpg?width=900&quality=90&secret=mAVZochI8TknazKkRayeVg",
          viewCount: 189,
          uploadDate: "27 خرداد 1403 16:33",
          duration: 486,
          categories: ["قانون و سیاست"],
          likes: 6
        },
        {
          id: "syvair0",
          embedId: "syvair0",
          title: "ما و هنر و آینده پیش رو",
          description: "دیدار استاد بدرالسماء و استاد طاهزاده",
          thumbnailUrl: "https://static.cdn.asset.aparat.com/avt/71232284-7262-l__3990.jpg?width=900&quality=90&secret=1bfBSLgv8QXNqHQI8ftE6A",
          viewCount: 28,
          uploadDate: "09 خرداد 1405 18:50",
          duration: 406,
          categories: ["فرهنگ و هنر"],
          likes: 1
        }
    ],
    "posts": [
        {
            "id": 2001, "author": "سُها", "authorAvatarUrl": "https://uploadkon.ir/uploads/ce6e18_25sohamedia.png", "date": "همین الان", "isoDate": new Date().toISOString(), "text": "مجموعه جدید «روایت ایران آینده» هم‌اکنون در بخش صوت قابل دسترس است.\n\nاین مجموعه به بررسی نسبت ما با دنیای جدید و امکان پیشرفت بومی می‌پردازد.", "likes": 342, "comments": [], "isPinned": true
        },
        {
            "id": 2002, "author": "محمد قائم‌خانی", "authorAvatarUrl": "https://soha-sima.ir/wp-content/uploads/2024/03/%D9%82%D8%A7%D8%A6%D9%85-%D8%AE%D8%A7%D9%86%DB%8C.jpg", "date": "۲ ساعت پیش", "isoDate": new Date(Date.now() - 7200000).toISOString(), "text": "روایت مقاومت، روایت صرفاً یک جنگ نیست؛ روایت انسانی است که در تنگنا، افق‌های جدیدی برای زیستن می‌سازد.", "likes": 89, "comments": [], "podcastId": 11, "episodeIndex": 0, "reactions": { "❤️": 12, "🙏": 5 }
        }
    ],
    "publishedBooks": [
        { "id": 501, "cover": "https://soha-sima.ir/wp-content/uploads/2026/05/ما-و-جهان-تکنیک-scaled.jpg", "title": "ما و جهان تکنیک", "subtitle": "جایگاه «ملت ایران» در جهان امروز", "description": "جهان امروز، جهان تکنیک است. نوشتار حاضر بر آن است تا به این پرسش بپردازد که چگونه می‌توان از چنگال تکنیک رهایی یافت.", "authorName": "نشر سرای هنر و اندیشه", "price": "۲۴۵,۰۰۰", "isNew": true, "type": "book", "buyUrl": "https://soha-sima.ir/product/ما-و-جهان-تکنیک/" },
        { "id": 502, "cover": "https://soha-sima.ir/wp-content/uploads/2026/05/راز-مادری-scaled.jpg", "title": "راز مادری", "subtitle": "مادر و «پناه بی‌عالمی در جهان امروز»", "description": "مجموعه گفت‌و‌گوهایی که بنا دارد به «سرآغاز» چیزی که فراموش کرده‌ایم برود و سراغ راز کلمات مادری را بگیرد.", "authorName": "نشر سرای هنر و اندیشه", "price": "۱۸۵,۰۰۰", "isNew": true, "type": "book", "buyUrl": "https://soha-sima.ir/product/راز-مادری/" },
        { "id": 503, "cover": "https://soha-sima.ir/wp-content/uploads/2026/05/بخت-نو1جوان-رو-scaled.jpg", "title": "بخت نوجوان", "subtitle": "زبانی که در آن «هستی نوجوان» به جوشش می‌آید", "description": "نوجوان به مثابه آینده است و می‌تواند خبر از یک آینده به ما بدهد؛ خبری که مظهر امید باشد.", "authorName": "نشر سرای هنر و اندیشه", "price": "۱۴۵,۰۰۰", "isNew": true, "type": "book", "buyUrl": "https://soha-sima.ir/product/بخت-نوجوان/" },
        { "id": 504, "cover": "https://soha-sima.ir/wp-content/uploads/2026/05/رئیسی-رو-scaled.jpg", "title": "ما و راه کربلایی شهید رئیسی", "subtitle": "بازخوانی مسئلهٔ سیاست دینی و نسبت وجودی با انسان‌ها", "description": "یادداشت استاد اصغر طاهرزاده درباره نسبت انقلاب و راه کربلایی شهید رئیسی.", "authorName": "نشر سرای هنر و اندیشه", "price": "۱۸۵,۰۰۰", "isNew": true, "type": "book", "buyUrl": "https://soha-sima.ir/product/ما-و-راه-کربلایی-شهید-رئیسی/" },
        { "id": 505, "cover": "https://soha-sima.ir/wp-content/uploads/2026/05/دانش-بنیان-رو-scaled.jpg", "title": "دانش‌بنیان", "subtitle": "گفتارهایی درباره‌ی «دانش‌بنیان»؛ نقطه تحول و حرکت به سمت آینده کشور", "description": "گفتارهایی درباره فرهنگ دانش‌بنیان با نگاه به شرکت دانش‌بنیان بهیارصنعت سپاهان. (مؤلف: امیر نجاتبخش)", "authorName": "امیر نجاتبخش", "price": "۱۳۵,۰۰۰", "isNew": true, "type": "book", "buyUrl": "https://soha-sima.ir/product/دانشبنیان/" },
        { "id": 506, "cover": "https://soha-sima.ir/wp-content/uploads/2026/05/دو-مقاله-رو-scaled.jpg", "title": "دو مقاله", "subtitle": "تاملی در ماهیت عقل در جهان کنونی / جهان علم", "description": "دو طرح بحث: ماهیت عقل (استاد طاهرزاده) و جهان علم (دکتر داوری اردکانی).", "authorName": "نشر سرای هنر و اندیشه", "price": "۱۴۵,۰۰۰", "isNew": true, "type": "book", "buyUrl": "https://soha-sima.ir/product/4701/" }
    ],
    "books": [
        { "id": 701, "title": "روایت پیشرفت ایرانی", "authorId": 2, "cover": "https://soha-sima.ir/wp-content/uploads/2025/05/photo_2025-05-04_13-51-23.jpg", "relatedEpisodes": [{ "podcastId": 10, "episodeIndex": 0 }], "categories": ["گفتمان پیشرفت"], "description": "متن پایه مباحث توسعه بومی." }
    ],
    "comments": []
}

export default db;
