# SOCIAL SECURITY KINGDOM — The Fall of the Crown

Sosial təhlükəsizlik mövzusunda 3D siyasi strategiya oyunu. Siz kralsınız: hər növbədə yeni sosial böhranla qarşılaşır, məsləhətçiləri dinləyir və qərar verirsiniz. Qərarlar göstəriciləri dərhal və gecikmiş şəkildə dəyişir, hadisələr bir-birinə təsir edir.

Bütün interfeys Azərbaycan dilindədir. Backend yoxdur: oyun tamamilə brauzerdə işləyir.

## Fayl strukturu

| Fayl | Məzmun |
|---|---|
| `index.html` | Tətbiqin strukturu, modulların qoşulması |
| `style.css` | Dizayn, animasiya, responsive görünüş, 2D ehtiyat fonlar |
| `scenarios.js` | 6 ölkə, 14 göstərici, 12 hadisə, zəncirvari təsirlər, 8 sonluq |
| `gameEngine.js` | Vəziyyət, növbələr, gecikmiş nəticələr, hakimiyyət böhranı, seed-li random |
| `3dScene.js` | Three.js səhnələri (proseduraldır, xarici model yoxdur) |
| `script.js` | Ekranlar, düymələr, nəticə paneli, LocalStorage |

## Lokal işə salma

Fayllar statikdir. Ən sadə yol:

```bash
cd social-security-kingdom
python3 -m http.server 8000
# brauzerdə: http://localhost:8000
```

`index.html` faylını birbaşa da açmaq olar. Three.js CDN-dən (`cdnjs`) yüklənir, buna görə internet lazımdır. Yüklənməzsə oyun 2D rejimdə işləyir.

## GitHub Pages-də yayımlama

1. GitHub-da yeni repozitoriya yaradın (məsələn `social-security-kingdom`).
2. Bütün faylları repozitoriyanın kökünə yükləyin:
   ```bash
   git init
   git add .
   git commit -m "Social Security Kingdom"
   git branch -M main
   git remote add origin https://github.com/<istifadəçi>/social-security-kingdom.git
   git push -u origin main
   ```
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch: `main`, folder: `/ (root)` seçib **Save** edin.
4. 1–2 dəqiqə sonra oyun `https://<istifadəçi>.github.io/social-security-kingdom/` ünvanında açılır.

## Oyun mexanikası

- **14 göstərici (0–100):** razılıq, sabitlik, iqtisadiyyat, büdcə, sosial müdafiə, sağlamlıq, məşğulluq, təhsil, bərabərlik, təhlükəsizlik, ekologiya, legitimlik, elitanın dəstəyi, gərginlik.
- **Passiv dinamika:** hər növbədə göstəricilər bir-birinə təsir edir (məsələn, aşağı təhsil məşğulluğu və iqtisadiyyatı yavaş-yavaş zəiflədir).
- **Gecikmiş nəticələr:** qərarlar 2–5 növbə sonra əlavə təsir göstərir. Bəzilərinin şərti var (məsələn, təhsil bazası zəifdirsə, yenidən ixtisaslaşma gecikir).
- **Zəncirvari hadisələr (`CHAINS`):** ardıcıl xərclər borc böhranına, ekoloji problemlər xəstəliyə, hüquq pozuntuları legitimlik itkisinə gətirir.
- **Gizli risklər:** hər ölkənin öz gizli riskləri var və oyun irəlilədikcə üzə çıxır.
- **Taxtdan salınma:** tək göstərici deyil, birləşmiş vəziyyət: gərginlik, razılıq, elita dəstəyi, büdcə, legitimlik. 5 pis sonluq (A–E) və 3 yaxşı/orta sonluq (F–H).
- **Çətinlik:** Asan (təsir işarələri görünür), Orta (daha az işarə), Çətin (rəqəmlər təxmini, məsləhətçilər qərəzli ola bilər, mənfi təsirlər daha güclüdür).
- **Məsləhətçilər:** hər biri öz prioritetlərinə görə variant tövsiyə edir. Etibarlılıq qərarların nəticəsinə görə dəyişir.

## Seed və test

Eyni gedişi təkrarlamaq üçün URL-ə seed əlavə edin: `index.html?seed=12345`.

Brauzersiz balans testi (Node.js):

```js
// node test.js kimi işlədin
const vm = require('vm'), fs = require('fs');
vm.runInThisContext(fs.readFileSync('scenarios.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('gameEngine.js', 'utf8'));
const S = Engine.newGame('aurelia', 2, 42);
while (true) { const r = Engine.startTurn(S); if (r.ending) break; Engine.applyChoice(S, 1); }
console.log(S.ended, S.turn);
```

## Yeni ölkə və ya hadisə əlavə etmək

- **Ölkə:** `scenarios.js` içində `COUNTRIES` massivinə eyni formatda obyekt əlavə edin (14 başlanğıc göstərici, `amp`, `hidden`).
- **Hadisə:** `SCENARIOS` massivinə `O(...)` və `D(...)` köməkçiləri ilə yeni hadisə əlavə edin. `w(c)` aktivləşmə çəkisini, `scene` isə 3D fonu müəyyən edir.
