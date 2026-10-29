"use strict";
/* ============================================================
   SOCIAL SECURITY KINGDOM — məlumat qatı
   Ölkələr, göstəricilər, hadisələr, zəncirvari təsirlər, sonluqlar
   Yeni ölkə əlavə etmək üçün COUNTRIES massivinə yeni obyekt əlavə edin.
   ============================================================ */

const STATS = [
  { id: "appr", n: "Xalqın razılığı" },
  { id: "stab", n: "Sosial sabitlik" },
  { id: "econ", n: "İqtisadi vəziyyət" },
  { id: "budg", n: "Dövlət büdcəsi" },
  { id: "prot", n: "Sosial müdafiənin əhatəliliyi" },
  { id: "heal", n: "Əhalinin sağlamlığı" },
  { id: "empl", n: "Məşğulluq" },
  { id: "educ", n: "Təhsil səviyyəsi" },
  { id: "equa", n: "Gəlir bərabərliyi" },
  { id: "safe", n: "Şəxsi təhlükəsizlik" },
  { id: "envi", n: "Ətraf mühitin vəziyyəti" },
  { id: "legi", n: "Kralın legitimliyi" },
  { id: "elit", n: "Siyasi elitanın dəstəyi" },
  { id: "tens", n: "İctimai gərginlik", inv: true }
];

const ADVISORS = [
  { id: "fin", n: "Maliyyə naziri", w: { budg: 3, econ: 2, elit: .5, appr: .5 }, why: "Maliyyə dayanıqlığı əsas prioritet olmalıdır." },
  { id: "soc", n: "Sosial müdafiə naziri", w: { prot: 2.5, equa: 2, heal: 1.5, educ: 1, appr: 1, empl: 1 }, why: "Həssas qrupların müdafiəsi qorunmalıdır." },
  { id: "sec", n: "Təhlükəsizlik müşaviri", w: { stab: 2.5, tens: -2.5, safe: 2, legi: 1.5, elit: 1 }, why: "İctimai sabitlik və nizam ön planda olmalıdır." },
  { id: "peo", n: "Xalqın nümayəndəsi", w: { appr: 3, empl: 1.5, equa: 1.5, heal: 1, tens: -1 }, why: "İnsanların gündəlik həyatı və etimadı vacibdir." }
];

/* ---------------- ÖLKƏLƏR ---------------- */
const COUNTRIES = [
  {
    id: "aurelia", name: "Aurelia", tag: "Sənaye gücü, ağır sosial yük", capital: "Solaris", pop: "14,2 milyon",
    econ: "Güclü sənaye iqtisadiyyatı, yüksək məşğulluq", sys: "Geniş, lakin bahalı sosial təminat sistemi", pol: "Nisbətən sabit, elita iqtisadi nəticələrə həssasdır",
    prob: ["Sosial təminat xərclərinin artımı", "Böyük şəhərlərdə mənzil təzyiqi", "Sənaye ixtisarları riski"],
    st: { appr: 60, stab: 62, econ: 75, budg: 50, prot: 68, heal: 66, empl: 76, educ: 70, equa: 52, safe: 60, envi: 48, legi: 62, elit: 65, tens: 38 },
    amp: { budg: 1.2 },
    hidden: [
      { at: 4, t: "Gizli dövlət borcu aşkarlandı", x: "Əvvəlki hakimiyyətin gizli öhdəlikləri büdcəyə əlavə yük gətirdi.", fx: { budg: -8, elit: -2 } },
      { at: 9, t: "Sənaye ixtisarları dalğası", x: "Böyük zavodlar istehsalı kiçildir.", fx: { empl: -6, econ: -4 }, fl: "layoff" }
    ]
  },
  {
    id: "nordheim", name: "Nordheim", tag: "Yaşlanan cəmiyyət, güclü sığorta", capital: "Hammerfjord", pop: "6,8 milyon",
    econ: "Sabit, lakin yavaş böyüyən iqtisadiyyat", sys: "Güclü sosial sığorta, yüksək standartlar", pol: "Çox sabit, lakin xalq yüksək gözləntilərlə yaşayır",
    prob: ["Əhalinin yaşlanması", "Pensiya fondunun dayanıqlığı", "Əmək qüvvəsi çatışmazlığı"],
    st: { appr: 58, stab: 72, econ: 62, budg: 45, prot: 80, heal: 74, empl: 66, educ: 74, equa: 66, safe: 70, envi: 66, legi: 66, elit: 60, tens: 28 },
    amp: { budg: 1.25 },
    hidden: [
      { at: 3, t: "Pensiya fondunun aktuar kəsiri", x: "Hesablamalar fondun gözləniləndən tez tükənəcəyini göstərir.", fx: { budg: -9, prot: -2 }, fl: "pensRisk" },
      { at: 8, t: "İşçi qüvvəsi çatışmazlığı", x: "Gənc işçilərin sayı sürətlə azalır.", fx: { econ: -4, empl: -3 } }
    ]
  },
  {
    id: "valoria", name: "Valoria", tag: "Gənc əhali, işsizlik təzyiqi", capital: "Veyra", pop: "31,5 milyon",
    econ: "Sürətlə böyüyən, lakin qeyri-sabit iqtisadiyyat", sys: "Zəif əhatə, məhdud yardım proqramları", pol: "Gənclərin narazılığı siyasi mühiti gərginləşdirir",
    prob: ["Gənclər arasında yüksək işsizlik", "Təhsilə və işə yüksək tələb", "Sosial təcrid"],
    st: { appr: 50, stab: 50, econ: 52, budg: 48, prot: 42, heal: 55, empl: 38, educ: 58, equa: 50, safe: 52, envi: 56, legi: 52, elit: 55, tens: 55 },
    amp: { tens: 1.3 },
    hidden: [
      { at: 4, t: "Radikal gənc qrupları", x: "İşsiz gənclər arasında radikal təşkilatlar güclənir.", fx: { tens: 8, safe: -5 }, fl: "youthIgnored" },
      { at: 9, t: "İxtisaslı kadr axını", x: "Təhsilli gənclər xaricə gedir.", fx: { educ: -5, econ: -3 } }
    ]
  },
  {
    id: "meridia", name: "Meridia", tag: "Ailə və icma, regional uçurum", capital: "Alma-Tera", pop: "19,0 milyon",
    econ: "Aqrar-xidmət iqtisadiyyatı, regionlar arasında fərq", sys: "Xidmətlərin böyük hissəsi ailələr vasitəsilə həyata keçirilir", pol: "Mərkəz sabitdir, regionlarda etimad zəifdir",
    prob: ["Ailələrin sosial yükü", "Regional bərabərsizlik", "Zəif rəsmi xidmət şəbəkəsi"],
    st: { appr: 56, stab: 60, econ: 50, budg: 42, prot: 45, heal: 52, empl: 55, educ: 52, equa: 40, safe: 58, envi: 58, legi: 58, elit: 58, tens: 40 },
    amp: { equa: 1.2 },
    hidden: [
      { at: 3, t: "Ailələrin dözümlülüyü tükənir", x: "Qayğı yükü ailələrin üzərinə düşür.", fx: { appr: -4, equa: -3, heal: -2 } },
      { at: 8, t: "Regional narazılıq", x: "Ucqar bölgələr özlərini unudulmuş sayır.", fx: { tens: 8, stab: -4 } }
    ]
  },
  {
    id: "ironcrest", name: "Ironcrest", tag: "Ağır sənaye, ekoloji risk", capital: "Forgemark", pop: "11,6 milyon",
    econ: "Ağır sənaye və dağ-mədən istehsalı", sys: "İşçi sığortası güclüdür, digər sahələr zəifdir", pol: "Sənaye elitası çox təsirlidir",
    prob: ["Ekoloji çirklənmə", "Sənaye böhranı riski", "Kütləvi işsizlik təhlükəsi"],
    st: { appr: 52, stab: 55, econ: 62, budg: 52, prot: 55, heal: 48, empl: 66, educ: 55, equa: 50, safe: 55, envi: 28, legi: 55, elit: 70, tens: 45 },
    amp: { envi: 1.3 },
    hidden: [
      { at: 4, t: "Zəhərli tullantı sızması", x: "Köhnə hövzədən təhlükəli tullantılar sızır.", fx: { envi: -8, heal: -5 }, fl: "toxic" },
      { at: 8, t: "Sənaye tələbinin sıxılması", x: "Xarici sifarişlər azalır.", fx: { empl: -8, econ: -6 } }
    ]
  },
  {
    id: "solandria", name: "Solandria", tag: "Zəngin azlıq, narazı çoxluq", capital: "Aurum", pop: "23,4 milyon",
    econ: "Qeyri-bərabər bölüşdürülən yüksək gəlirlər", sys: "Zəif əhatə, imtiyazlı xidmətlər", pol: "Elita güclüdür, xalq etimadı zəifdir",
    prob: ["Zəngin və yoxsul arasında dərin uçurum", "Zəif sosial mobillik", "Qütbləşmə"],
    st: { appr: 45, stab: 45, econ: 58, budg: 55, prot: 35, heal: 50, empl: 52, educ: 48, equa: 22, safe: 48, envi: 50, legi: 48, elit: 72, tens: 62 },
    amp: { tens: 1.25 },
    hidden: [
      { at: 3, t: "Elitanın vergidən yayınması", x: "Xəzinə böyük gəlir itirir.", fx: { budg: -6, legi: -2 } },
      { at: 7, t: "Orta təbəqənin sıxışdırılması", x: "Orta təbəqə yoxsullaşır.", fx: { appr: -6, stab: -5, tens: 4 } }
    ]
  }
];

/* ---------------- HADİSƏLƏR ----------------
   O(mətn, dərhal təsir, gecikmiş[], bayraqlar[], izah)
   D(neçə növbə sonra, təsir, mesaj, şərt?)                       */
const O = (t, fx, dl, fl, x) => ({ t, fx, dl: dl || [], fl: fl || [], x });
const D = (t, fx, m, c) => ({ t, fx, m, c });

const SCENARIOS = [
  {
    id: "pension", t: "Pensiya böhranı", scene: "elder", min: 1,
    d: "Yaşlı əhalinin sayı artır, pensiya fondunun daxilolmaları isə xərcləri ödəmir.",
    cause: "Doğum səviyyəsinin azalması və ömür uzunluğunun artması.",
    groups: ["Yaşlılar", "Gənc işçilər", "Büdcə maliyyəçiləri"],
    prob: "Yaşlıların rifahı ilə maliyyə dayanıqlığı arasında seçim etməlisən.",
    w: c => 1 + (c.cid === "nordheim" ? 2 : 0) + (c.f("pensUp", 8) ? .8 : 0) + (c.f("pensRisk") ? 1 : 0),
    o: [
      O("Pensiyaları artırmaq", { appr: 8, stab: 3, prot: 6, equa: 3, budg: -12, elit: -1 },
        [D(3, { budg: -6, econ: -3 }, "Pensiya xərcləri büdcəni sıxır.", c => c.st.budg < 55)], ["spend", "pensUp"],
        "Yaşlıların rifahı yüksəlir, lakin maliyyə mənbəyi göstərilməsə büdcə yükü artır və gələcək öhdəliklər böyüyür."),
      O("Pensiya yaşını dəyişdirmək", { budg: 9, appr: -9, tens: 7, equa: -2, legi: -3 },
        [D(3, { appr: -3, elit: 2 }, "Narazılıq səngiyir, maliyyəçilər razı qalır."), D(4, { econ: 3 }, "İşçi qüvvəsinin əmək dövrü uzandı.")], ["reform"],
        "Fonda təzyiq azalır, lakin insanlar sosial müqavilənin pozulduğunu hiss edir. Legitimlik bahasına büdcə qazanılır."),
      O("Pensiya sisteminin maliyyələşmə mexanizmini islah etmək", { budg: 4, appr: -2, elit: -3, econ: 2 },
        [D(3, { budg: 7, prot: 4, legi: 3 }, "İslahat nəticə verir: fond daha dayanıqlıdır."), D(4, { econ: 3 }, "Uzunmüddətli maliyyə proqnozu yaxşılaşdı.")], [],
        "İslahatın nəticəsi gec görünür, lakin həm maliyyə dayanıqlığını, həm də sosial müdafiəni uzunmüddətli qoruyur."),
      O("Pensiya xərclərini azaltmaq", { budg: 11, appr: -12, prot: -9, equa: -6, tens: 8, legi: -6 },
        [D(2, { tens: 5, heal: -3 }, "Yaşlılar arasında yoxsulluq və narazılıq artır.")], ["cut"],
        "Qısamüddətli büdcə təzyiqi azalır, lakin yaşlıların yoxsulluq riski və kralın legitimliyinə zərər artır.")
    ]
  },
  {
    id: "unemp", t: "Kütləvi işsizlik", scene: "factory", min: 1,
    d: "Sənaye müəssisələri minlərlə işçini ixtisar edir. Ailələr gəlirsiz qalır.",
    cause: "Sifarişlərin azalması və texnologiya dəyişikliyi.",
    groups: ["Sənaye işçiləri", "Gənclər", "Yerli sahibkarlar"],
    prob: "Müvəqqəti yardım, yenidən ixtisaslaşma, yeni iş yerləri və ya xərc qənaəti arasında seçim.",
    w: c => 1 + (c.st.empl < 50 ? 1.5 : 0) + (c.f("layoff") ? 1.5 : 0) + (c.cid === "ironcrest" ? .8 : 0),
    o: [
      O("İşsizlərə müvəqqəti maliyyə yardımı", { appr: 5, stab: 4, budg: -8, prot: 3, tens: -4 },
        [D(3, { budg: -4, tens: 3 }, "Müvəqqəti yardım bitir, problem qayıdır.")], ["spend"],
        "Dərhal sosial sakitlik yaranır, lakin işsizliyin səbəbi həll olunmur."),
      O("Peşə hazırlığı və yenidən ixtisaslaşma proqramları", { budg: -6, educ: 6, appr: 2, empl: 2 },
        [D(3, { empl: 8, econ: 4, appr: 3 }, "Yenidən hazırlanan işçilər işə qayıdır.", c => c.st.educ >= 45),
         D(5, { empl: 5, econ: 2 }, "Zəif təhsil bazası səbəbindən proqramın nəticəsi gecikdi.", c => c.st.educ < 45)], [],
        "Uzunmüddətli məşğulluğu yaxşılaşdırır. Təhsil bazası zəifdirsə, nəticə gec görünür."),
      O("Yeni iş yerlərinin yaradılmasına investisiya", { budg: -10, econ: 4, empl: 5 },
        [D(3, { empl: 7, econ: 5, budg: 3 }, "Yeni müəssisələr işləməyə başladı.")], ["spend"],
        "Bahalı, lakin həm məşğulluğu, həm də gələcək vergi daxilolmalarını artırır."),
      O("Dövlət xərclərini azaltmaq", { budg: 7, appr: -8, empl: -5, tens: 6, stab: -4, prot: -4 },
        [D(2, { tens: 4, appr: -3 }, "Küçələrdə narazılıq artır.")], ["cut"],
        "Büdcə qısa müddətə yüngülləşir, lakin işsizlik və gərginlik dərinləşir.")
    ]
  },
  {
    id: "aid", t: "Sosial yardımın azaldılması təklifi", scene: "budget", min: 2,
    d: "Büdcədə kəsir yaranıb. Maliyyə naziri sosial yardım xərclərinin azaldılmasını təklif edir.",
    cause: "Gəlirlərin azalması və xərclərin artması.",
    groups: ["Yoxsul ailələr", "Əlillər", "Maliyyə sektoru"],
    prob: "Büdcə dayanıqlığını qorumaq və həssas qrupları müdafiə etmək arasında tarazlıq.",
    w: c => c.st.budg < 40 ? 3 : .6,
    o: [
      O("Yardımı hamı üçün azaltmaq", { budg: 9, prot: -10, equa: -5, appr: -8, tens: 6 },
        [D(2, { tens: 5 }, "Yoxsulluq artır, narazılıq güclənir."), D(3, { heal: -3, equa: -3 }, "Həssas qrupların vəziyyəti pisləşir.")], ["cut"],
        "Büdcə qısamüddətli yaxşılaşır, lakin yoxsulluq, bərabərsizlik və sosial gərginlik artır."),
      O("Yardımı ən həssas qruplar üçün qorumaq", { budg: 5, prot: -2, appr: -3, equa: 1, elit: -1 },
        [D(3, { legi: 3 }, "Dövlətin ədalətli seçim etdiyi qəbul olunur.")], [],
        "Qənaət edilir, lakin ən ehtiyaclılar qorunur. Bu, nisbətən balanslı yoldur."),
      O("Ehtiyacların qiymətləndirilməsini təkmilləşdirmək", { budg: 3, prot: 2, elit: -1, legi: 1 },
        [D(3, { budg: 6, prot: 3, equa: 2 }, "Yardım daha dəqiq ünvanlanır, israf azalır."), D(4, { legi: 3 }, "Sistemə etimad artır.")], [],
        "Dərhal effekti zəifdir, lakin ünvanlı yardım həm xərcləri, həm də yoxsulluğu azaldır."),
      O("Yeni maliyyə mənbələri axtarmaq", { budg: 8, econ: -3, elit: -5, appr: -3 },
        [D(3, { budg: 3, econ: 2 }, "Yeni gəlirlər sistemə oturur.")], [],
        "Sosial proqramlar qorunur, lakin elita və biznes əlavə yükdən narazı qalır.")
    ]
  },
  {
    id: "protest", t: "Kütləvi etirazlar", scene: "square", min: 3,
    d: "Paytaxtın mərkəzində minlərlə insan sosial müdafiənin zəifləməsinə etiraz edir.",
    cause: "Həll olunmamış sosial problemlər və itirilmiş etimad.",
    groups: ["Etirazçılar", "Hüquq-mühafizə", "Siyasi elita"],
    prob: "Etiraz problemlərin göstəricisidir. Cavabın legitimliyi müəyyən edəcək.",
    w: c => (c.st.tens > 55 ? 2.5 : .3) + (c.f("cut", 5) ? 2 : 0) + (c.f("repress", 5) ? 1 : 0),
    o: [
      O("Etirazçıların tələblərini dinləyərək danışıqlara başlamaq", { tens: -9, appr: 4, legi: 3, budg: -4, elit: -2 },
        [D(3, { stab: 4 }, "Danışıqlar sabitliyi bərpa edir.")], ["dialogue"],
        "Gərginlik azalır və etimad artır. Tələblər maliyyə öhdəliyi yaratsa da, legitimlik qorunur."),
      O("Sosial proqramların yenidən qiymətləndirilməsi üçün komissiya yaratmaq", { tens: -4, legi: 2, appr: 1, budg: -2 },
        [D(3, { prot: 4, tens: -4, legi: 3 }, "Komissiyanın tövsiyələri tətbiq olunur.")], [],
        "Problemin kökünə baxan yanaşma gec nəticə verir, lakin dayanıqlıdır."),
      O("İctimai təhlükəsizliyi qoruyaraq qanuni etiraz imkanlarını təmin etmək", { tens: -5, stab: 3, safe: 3, legi: 3, appr: 1 },
        [D(2, { tens: 2 }, "Səbəblər həll olunmadığı üçün gərginlik tam azalmır.", c => c.st.prot < 45)], [],
        "Hüquqlar qorunur və nizam saxlanır, lakin sosial problemlər ayrıca həll olunmalıdır."),
      O("Problemin səbəblərini araşdırmadan sərt məhdudiyyətlər tətbiq etmək", { tens: -8, stab: 4, legi: -9, appr: -8, elit: 3 },
        [D(2, { tens: 10, legi: -4 }, "Sərtlik narazılığı gizli şəkildə böyüdür."), D(3, { stab: -6, appr: -5 }, "Qarşıdurma yenidən alovlanır.")], ["repress"],
        "Qısamüddətli sakitlik yaranır, lakin hüquqların pozulması uzunmüddətli böhran riskini artırır.")
    ]
  },
  {
    id: "health", t: "Səhiyyə sistemində böhran", scene: "hospital", min: 1,
    d: "Yoluxucu xəstəlik yayılır. Xəstəxanalarda yer və tibbi resurs çatışmır.",
    cause: "Zəif profilaktika, ətraf mühit problemləri və məhdud xəstəxana imkanları.",
    groups: ["Xəstələr", "Tibb işçiləri", "Yaşlılar və uşaqlar"],
    prob: "Sürətli reaksiya və uzunmüddətli hazırlıq arasında seçim.",
    w: c => 1 + (c.st.envi < 45 ? 1.5 : 0) + (c.st.heal < 50 ? 1 : 0) + (c.f("toxic") ? 1 : 0),
    o: [
      O("Səhiyyə xərclərini artırmaq", { heal: 7, budg: -10, appr: 4, empl: 1 },
        [D(3, { heal: 4 }, "Əlavə yataq və avadanlıq vəziyyəti sabitləşdirir.")], ["spend"],
        "Dərhal effekt verir, lakin bahalıdır və profilaktikanı əvəz etmir."),
      O("Ən riskli qruplara üstünlük verən tibbi yardım proqramı yaratmaq", { heal: 6, equa: 2, budg: -6, prot: 4, appr: 3 },
        [D(3, { heal: 3, legi: 2 }, "Risk qrupları arasında ölüm halları azalır.")], [],
        "Resurslar ən çox ehtiyacı olanlara yönəlir. Həm səhiyyə, həm bərabərlik üçün balanslı yoldur."),
      O("Profilaktika və ictimai maarifləndirməyə investisiya qoymaq", { heal: 3, budg: -4, appr: 1 },
        [D(3, { heal: 7, budg: 3, empl: 3 }, "Yoluxma azalır, işçi qüvvəsi sağlamlaşır."), D(4, { econ: 2 }, "Məhsuldarlıq artır.")], [],
        "Effekti gec gəlir, lakin ən ucuz və dayanıqlı yoldur."),
      O("Problemin həllini tamamilə fərdi məsuliyyətə buraxmaq", { budg: 3, heal: -10, appr: -9, equa: -5, legi: -5 },
        [D(2, { empl: -5, econ: -3 }, "Xəstələnənlər işə gedə bilmir."), D(3, { tens: 5 }, "İctimai qəzəb artır.")], ["neglect"],
        "Büdcə xərci yoxdur, lakin xəstəlik yayılır və dövlətə etimad çökür.")
    ]
  },
  {
    id: "school", t: "Məktəblərdə bərabərsizlik", scene: "school", min: 2,
    d: "Paytaxt məktəbləri ilə ucqar regionlardakı məktəblər arasında ciddi fərq yaranıb.",
    cause: "Qeyri-bərabər maliyyələşmə və müəllim çatışmazlığı.",
    groups: ["Region şagirdləri", "Müəllimlər", "Valideynlər"],
    prob: "Bərabər imkanlar yaratmaq, yoxsa mövcud bölgünü saxlamaq.",
    w: c => 1 + (c.st.educ < 55 ? 1 : 0) + (c.cid === "meridia" ? 1.2 : 0),
    o: [
      O("Region məktəblərinə investisiya qoymaq", { educ: 7, budg: -9, equa: 3, appr: 3 },
        [D(3, { educ: 5, empl: 4, equa: 3 }, "Region məzunlarının imkanları artır."), D(4, { econ: 3 }, "İxtisaslı kadr bazası genişlənir.")], ["spend"],
        "Təhsil və sosial mobillik üçün güclü sərmayədir, lakin nəticəsi gec görünür."),
      O("Rəqəmsal təhsil proqramı yaratmaq", { educ: 4, budg: -5, econ: 1 },
        [D(3, { educ: 3, empl: 3 }, "Rəqəmsal bacarıqlar yayılır.")], [],
        "Daha ucuz yoldur, lakin internetə çıxışı olmayanlar geridə qala bilər."),
      O("Təhsilin maliyyələşdirilməsini yalnız nəticələrə əsaslandırmaq", { budg: 3, educ: -3, equa: -5, appr: -4 },
        [D(3, { equa: -4, tens: 3 }, "Güclü məktəblər daha da güclənir, zəiflər geridə qalır.")], [],
        "Səmərəlilik artır, lakin başlanğıcda zəif olanlar cəzalanır."),
      O("Mövcud bölgünü dəyişmədən saxlamaq", { educ: -3, appr: -3 },
        [D(3, { educ: -3, empl: -3, tens: 3 }, "Regional narazılıq və ixtisaslı kadr çatışmazlığı artır.")], ["eduneglect"],
        "Xərc yoxdur, lakin bərabərsizlik möhkəmlənir.")
    ]
  },
  {
    id: "housing", t: "Mənzil böhranı", scene: "housing", min: 2,
    d: "Kirayə qiymətləri sürətlə artır. Aztəminatlı ailələr yaşayış yerini itirmək riski ilə üzləşir.",
    cause: "Şəhərlərə miqrasiya və yetərsiz tikinti.",
    groups: ["Kirayəçilər", "Gənc ailələr", "Daşınmaz əmlak sahibləri"],
    prob: "Dövlət müdaxiləsi ilə bazar həlli arasında seçim.",
    w: c => 1 + (c.st.equa < 45 ? 1 : 0) + (c.cid === "aurelia" ? 1 : 0),
    o: [
      O("Sosial mənzil proqramı", { prot: 5, equa: 4, appr: 5, budg: -11, tens: -4 },
        [D(4, { budg: -3, equa: 3 }, "Mənzil fondu genişlənir, saxlama xərci artır.")], ["spend"],
        "Əlçatanlığı artırır, lakin ağır büdcə yükü yaradır."),
      O("Hədəfli mənzil yardımı", { prot: 4, equa: 2, budg: -6, appr: 3, tens: -3 },
        [D(3, { stab: 3 }, "Köçürülmə halları azalır.")], [],
        "Ən ehtiyaclı ailələrə yönəlir, xərc nisbətən idarə olunandır."),
      O("Özəl tikinti və kirayə bazarının genişlənməsini dəstəkləmək", { econ: 5, budg: -2, empl: 3, equa: -2, elit: 3 },
        [D(3, { econ: 3, equa: -2, tens: 2 }, "Təklif artır, lakin ən aşağı gəlirlilər üçün əlçatanlıq zəif qalır.")], [],
        "İqtisadi fəallığı artırır, lakin ən həssas qruplar bazarda qalır."),
      O("Dövlətin müdaxiləsini minimuma endirmək", { budg: 2, equa: -5, tens: 6, appr: -6, elit: 2 },
        [D(2, { tens: 4, safe: -3 }, "Evsizlik və qəsəbələşmə artır."), D(3, { stab: -3 }, "Şəhər məhəllələrində sosial sabitlik azalır.")], [],
        "Xərc yoxdur, lakin sosial gərginlik və qeyri-bərabərlik artır.")
    ]
  },
  {
    id: "eco", t: "Ekoloji fəlakət", scene: "smoke", min: 2,
    d: "Sənaye bölgəsində zəhərli tullantılar yayılır. Əhali sağlamlıq riski ilə üzləşir.",
    cause: "Nəzarətsiz sənaye fəaliyyəti və köhnə texnologiyalar.",
    groups: ["Bölgə sakinləri", "Zavod işçiləri", "Sənaye sahibləri"],
    prob: "Sağlamlıq, məşğulluq və iqtisadi maraqlar toqquşur.",
    w: c => .8 + (c.st.envi < 50 ? 2 : 0) + (c.f("ignoreEco") ? 1 : 0) + (c.cid === "ironcrest" ? 1.5 : 0),
    o: [
      O("Müəssisəni dərhal dayandırmaq", { envi: 10, heal: 5, empl: -8, econ: -6, elit: -4, budg: -3, appr: 1 },
        [D(3, { tens: 3 }, "İşsiz qalan işçilər narazılıq edir.")], [],
        "Sağlamlıq qorunur, lakin işçilər və iqtisadiyyat ağır zərbə alır."),
      O("İstehsalı mərhələli dayandıraraq işçilər üçün keçid proqramı yaratmaq", { envi: 7, heal: 3, budg: -6, empl: -2, appr: 3, elit: -1 },
        [D(3, { envi: 4, empl: 3, legi: 2 }, "Keçid proqramı işləyir, ətraf mühit bərpa olunur.")], [],
        "Ekoloji və sosial hədəflər balanslaşdırılır, lakin bahalıdır."),
      O("Ekoloji standartları sərtləşdirmək və müəssisəyə uyğunlaşma müddəti vermək", { envi: 4, budg: -2, econ: -1, elit: -1 },
        [D(3, { envi: 4, heal: 2 }, "Müəssisə standartlara tədricən uyğunlaşır.")], [],
        "Orta yoldur: iqtisadiyyat qorunur, lakin sağlamlıq riski bir müddət davam edir."),
      O("İqtisadi itkilərdən qaçmaq üçün müdaxiləni gecikdirmək", { budg: 3, econ: 2, elit: 3, envi: -6, heal: -4 },
        [D(2, { heal: -5, appr: -5 }, "Xəstələnmə halları artır."), D(3, { budg: -6, tens: 5 }, "Səhiyyə xərcləri və etirazlar artır.")], ["ignoreEco"],
        "Qısamüddətli iqtisadi rahatlıq uzunmüddətli sağlamlıq və büdcə zərərinə çevrilir.")
    ]
  },
  {
    id: "ineq", t: "Gəlir bərabərsizliyinin artması", scene: "city", min: 2,
    d: "Ən zəngin 10 faiz əhalinin gəliri kəskin artır, digər qrupların gəlirləri dəyişmir.",
    cause: "Kapital gəlirlərinin artması və əmək haqqının durğunluğu.",
    groups: ["Aşağı və orta gəlirlilər", "Zəngin təbəqə", "Gənc işçilər"],
    prob: "Bölüşdürmə siyasətini dəyişmək, yoxsa mövcud vəziyyəti saxlamaq.",
    w: c => 1 + (c.st.equa < 45 ? 2 : 0) + (c.cid === "solandria" ? 1.5 : 0),
    o: [
      O("Vergi sistemində dəyişiklik etmək", { equa: 6, budg: 7, elit: -8, econ: -2 },
        [D(3, { econ: -2, budg: 3, legi: 2 }, "Vergi gəlirləri artır, elita müqavimət göstərir.")], [],
        "Bərabərlik və büdcə yaxşılaşır, lakin elitanın dəstəyi zəifləyir."),
      O("Sosial yardım və təhsil imkanlarını genişləndirmək", { equa: 5, educ: 3, prot: 4, budg: -9, appr: 4 },
        [D(4, { equa: 3, econ: 3 }, "Sosial mobillik artır, iqtisadiyyat genişlənir.")], ["spend"],
        "Uzunmüddətli sosial mobilliyi artırır, lakin büdcəyə yük salır."),
      O("Məşğulluq və əməkhaqqı siyasətini yeniləmək", { equa: 4, empl: 3, appr: 4, econ: -2, elit: -3 },
        [D(3, { econ: 2, tens: -3 }, "Gəlirlər artır, narazılıq azalır.")], [],
        "Gəlirləri birbaşa dəstəkləyir, biznes üçün xərcləri artırır."),
      O("Mövcud vəziyyəti dəyişmədən saxlamaq", { equa: -6, tens: 6, appr: -4, elit: 3, budg: 1 },
        [D(3, { equa: -3, stab: -4 }, "Qütbləşmə dərinləşir.")], [],
        "Elita razıdır, lakin cəmiyyət daha da bölünür.")
    ]
  },
  {
    id: "demog", t: "Demoqrafik dəyişiklik", scene: "city", min: 3,
    d: "Doğum səviyyəsi azalır, əmək qabiliyyətli əhalinin payı kiçilir.",
    cause: "Yüksək yaşayış xərcləri və ailələrin qeyri-müəyyənliyi.",
    groups: ["Gənc ailələr", "Əmək bazarı", "Pensiyaçılar"],
    prob: "Ailələrə dəstək, xidmətlər və məhsuldarlıq arasında seçim.",
    w: c => 1 + (c.cid === "nordheim" ? 1 : 0) + (c.f("reform", 6) ? .5 : 0),
    o: [
      O("Uşaqlı ailələrə dəstək", { appr: 5, prot: 3, budg: -9, equa: 2 },
        [D(4, { econ: 2, budg: -3 }, "Doğum azacıq artır, xərclər davam edir.")], ["spend"],
        "Ailələrə rahatlıq verir, lakin effekt yavaşdır."),
      O("Uşaq baxımı xidmətlərinin əlçatanlığını artırmaq", { empl: 4, equa: 3, budg: -7, appr: 3 },
        [D(3, { econ: 3, empl: 3 }, "Valideynlər, xüsusən qadınlar işə qayıdır.")], [],
        "Həm məşğulluğu, həm də ailə rifahını gücləndirir."),
      O("Əmək məhsuldarlığı və texnologiyaya investisiya", { econ: 5, budg: -6, empl: -2, educ: 2 },
        [D(3, { econ: 5, budg: 4 }, "Məhsuldarlıq artır, əmək çatışmazlığı yüngülləşir.")], [],
        "Az işçi ilə çox istehsal üçün strategiya, lakin bəzi işçilər kənarda qala bilər."),
      O("Heç bir tədbir görməmək", { budg: 3 },
        [D(3, { budg: -5, econ: -3, prot: -3 }, "Əmək bazarı və pensiya fondu sıxılır."), D(4, { econ: -3, tens: 3 }, "Demoqrafik problem dərinləşir.")], ["demogIgnored"],
        "Dərhal xərc yoxdur, lakin problem sonradan daha bahalı olur.")
    ]
  },
  {
    id: "crime", t: "Cinayətkarlıq və şəxsi təhlükəsizlik", scene: "night", min: 2,
    d: "Şəhərlərdə cinayətkarlıq artır, insanlar özlərini təhlükəsiz hiss etmirlər.",
    cause: "Gənclər arasında işsizlik, yoxsulluq və yetərsiz profilaktika.",
    groups: ["Şəhər sakinləri", "Gənclər", "Hüquq-mühafizə orqanları"],
    prob: "Cəza tədbirləri ilə sosial profilaktika arasında balans.",
    w: c => .8 + (c.st.safe < 50 ? 2.5 : 0) + (c.f("youthIgnored") ? 1 : 0),
    o: [
      O("İctimai təhlükəsizlik və hüquq-mühafizə xidmətlərini gücləndirmək", { safe: 8, budg: -6, appr: 3, tens: -2 },
        [D(3, { tens: 3, safe: -2 }, "Köklər həll olunmadığı üçün cinayətlər qayıdır.")], [],
        "Dərhal təhlükəsizlik artır, lakin sosial səbəblər qalır."),
      O("Gənclərin təhsili, məşğulluğu və sosial inteqrasiyasına investisiya qoymaq", { educ: 3, empl: 3, safe: 2, budg: -8 },
        [D(3, { safe: 8, tens: -4, equa: 2 }, "Gənc cinayətkarlığı azalır."), D(4, { empl: 3 }, "Gənclər işə cəlb olunur.")], [],
        "Effekti gec gəlir, lakin cinayətin kökünə təsir edir."),
      O("Hüquq-mühafizə tədbirləri ilə sosial profilaktikanı birləşdirmək", { safe: 5, budg: -7, appr: 3, equa: 1, legi: 2 },
        [D(3, { safe: 5, tens: -3 }, "Kompleks yanaşma nəticə verir.")], [],
        "Həm sürətli, həm də dayanıqlı nəticə üçün balanslı yoldur."),
      O("Problemi yalnız cəza tədbirləri ilə həll etməyə çalışmaq", { safe: 6, appr: 1, equa: -4, legi: -6, tens: 4 },
        [D(2, { tens: 5 }, "Sərtlik cəmiyyətdə qorxu yaradır."), D(3, { safe: -5, legi: -3 }, "Cinayətkarlıq yenidən artır, hüquq pozuntuları üzə çıxır.")], ["repress", "youthIgnored"],
        "Qısamüddətli təsir yaradır, lakin hüquqları pozur və sosial gərginliyi artırır.")
    ]
  },
  {
    id: "polar", t: "Sosial qütbləşmə və siyasi böhran", scene: "throne", min: 5,
    d: "Cəmiyyət bir-birinə qarşı duran qruplara bölünür. Siyasi elitada da fikir ayrılıqları dərinləşir.",
    cause: "Yığılmış bərabərsizlik və cavabsız qalmış etirazlar.",
    groups: ["Qarşı-qarşıya duran qruplar", "Siyasi elita", "Mülki cəmiyyət"],
    prob: "Dialoq, araşdırma, yenidən bölgü və ya tənqidləri görməzlikdən gəlmək.",
    w: c => .3 + (c.st.elit < 45 || c.st.tens > 60 ? 2.5 : 0) + (c.st.equa < 35 ? 1 : 0),
    o: [
      O("İctimai dialoq platforması yaratmaq", { tens: -6, legi: 4, elit: 3, appr: 3, budg: -2 },
        [D(3, { stab: 4 }, "Dialoq qarşıdurmanı yumşaldır.")], ["dialogue"],
        "Qruplar arasında etimad bərpa olunur, nəticə isə səbr tələb edir."),
      O("Regional və sosial bərabərsizlikləri araşdırmaq", { equa: 2, legi: 3, tens: -3, budg: -3 },
        [D(3, { equa: 3, appr: 3 }, "Aşkarlanan problemlər həll olunmağa başlayır.")], [],
        "Problemin kökünü göstərir, lakin addımlar sonradan atılmalıdır."),
      O("Sosial proqramların resurslarını ehtiyaclara uyğun yenidən bölüşdürmək", { equa: 4, prot: 3, appr: 4, elit: -6, budg: -3 },
        [D(3, { stab: 3, tens: -3 }, "Bölgü daha ədalətli qəbul olunur.")], [],
        "Ədaləti artırır, lakin imtiyazlarını itirən elitanı narahat edir."),
      O("Tənqidləri görməzlikdən gəlmək", { tens: 7, legi: -8, elit: -6, appr: -5 },
        [D(2, { stab: -5 }, "Qarşıdurma açıq mərhələyə keçir."), D(3, { elit: -5, tens: 5 }, "Elita arasında çevriliş söhbətləri başlayır.")], ["ignoreCrit"],
        "Qısamüddətli rahatlıq verir, lakin legitimlik və elitanın dəstəyi çökür.")
    ]
  }
];

/* -------- Hadisələrarası zəncirvari təsirlər -------- */
const CHAINS = [
  { id: "skills", cd: 4, c: c => c.turn > 3 && c.st.educ < 40, fx: { econ: -4, empl: -2, budg: -3 }, m: "Təhsilə zəif investisiya ixtisaslı işçi çatışmazlığı yaratdı: vakansiyalar doldurulmur, məhsuldarlıq və vergi daxilolmaları azalır." },
  { id: "sick", cd: 4, c: c => c.st.envi < 35, fx: { heal: -5, budg: -3, appr: -3 }, m: "Çirklənmiş mühit xəstəlik hallarını artırdı: səhiyyə xərcləri yüksəlir, iş qabiliyyəti zəifləyir." },
  { id: "auster", cd: 4, c: c => c.f("cut", 5) && c.st.prot < 45, fx: { tens: 5, equa: -3, elit: -2 }, m: "Sosial xərclərin kəsilməsi yoxsulluğu və ictimai gərginliyi artırdı." },
  { id: "debt", cd: 4, c: c => c.n("spend") >= 3 && c.st.budg < 35, fx: { budg: -7, econ: -4, legi: -2 }, m: "Maliyyə imkanları nəzərə alınmadan edilən xərclər borc və maliyyələşmə problemi yaratdı." },
  { id: "polar", cd: 4, c: c => c.st.equa < 35 && c.st.tens > 58, fx: { elit: -5, stab: -4 }, m: "Bərabərsizlik qütbləşməni gücləndirdi: elitada fikir ayrılıqları dərinləşir." },
  { id: "rights", cd: 3, c: c => c.f("repress", 4), fx: { legi: -5, tens: 3 }, m: "Hüquqların məhdudlaşdırılması kralın legitimliyini zədələdi." },
  { id: "pdebt", cd: 5, c: c => c.f("pensUp", 10) && c.st.budg < 35, fx: { budg: -6, elit: -3 }, m: "Pensiya xərclərinin artımı büdcə böhranına çevrilir." },
  { id: "youth", cd: 4, c: c => c.f("youthIgnored", 6) && c.st.tens > 50, fx: { safe: -5, tens: 3 }, m: "Diqqətsiz qalan gənclər arasında cinayətkarlıq və təcrid artır." },
  { id: "neglect", cd: 4, c: c => c.f("neglect", 6), fx: { heal: -4, empl: -3 }, m: "Səhiyyənin fərdi məsuliyyətə buraxılması işçi qüvvəsini zəiflədir." },
  { id: "demog", cd: 5, c: c => c.f("demogIgnored", 8), fx: { empl: -4, budg: -3 }, m: "Əmək qabiliyyətli əhalinin azalması əmək bazarını sıxır." },
  { id: "good1", cd: 4, c: c => c.st.educ > 65 && c.st.empl > 60, fx: { econ: 3, budg: 3 }, m: "Təhsil və məşğulluğa davamlı investisiya iqtisadi artımı gücləndirir." },
  { id: "good2", cd: 4, c: c => c.st.stab > 70 && c.st.safe > 60, fx: { econ: 2, legi: 2 }, m: "Sabit və təhlükəsiz mühit investisiyaları və etimadı artırır." },
  { id: "ignore", cd: 4, c: c => c.f("ignoreCrit", 5), fx: { elit: -3, appr: -3 }, m: "Tənqidlərin görməzlikdən gəlinməsi kralın ətrafında narahatlığı artırır." }
];

/* -------- Sonluqlar -------- */
const ENDINGS = {
  A: { t: "Xalq üsyanı", type: "bad", scene: "fall", x: "İctimai gərginlik kritik həddə çatdı. İnsanlar meydanlara çıxdı və saray qapıları açıldı." },
  B: { t: "Saray çevrilişi", type: "bad", scene: "fall", x: "Xalq hələ sakit idi, lakin elita kralı dəstəkləməkdən imtina etdi və hakimiyyət gecə ərzində əldən çıxdı." },
  C: { t: "İqtisadi çöküş", type: "bad", scene: "fall", x: "Xəzinə boşaldı, iqtisadiyyat iflic oldu və sosial proqramları maliyyələşdirmək mümkün olmadı." },
  D: { t: "Sosial dağılma", type: "bad", scene: "fall", x: "Yoxsulluq, işsizlik və gərginlik eyni vaxtda yüksəldi. Cəmiyyət idarəolunmaz oldu." },
  E: { t: "Legitimlik böhranı", type: "bad", scene: "fall", x: "Xalq və institutlar kralın qərarlarına inanmağı dayandırdı. Taxt boş qaldı." },
  F: { t: "Tarixə düşən kral", type: "good", scene: "city", x: "Siz sosial təhlükəsizliyi, iqtisadi dayanıqlığı və siyasi sabitliyi bir arada qoruyaraq krallığı çətin illərdən çıxardınız." },
  G: { t: "Kövrək qələbə", type: "mid", scene: "throne", x: "Taxtınızı qorudunuz, lakin bir sıra sosial problemlər həll olunmamış qaldı. Sabitlik kövrəkdir." },
  H: { t: "İslahatçı kral", type: "good", scene: "city", x: "Hakimiyyətiniz davam edir və sosial təhlükəsizlik sistemi uzunmüddətli dayanıqlıq qazanıb." }
};
