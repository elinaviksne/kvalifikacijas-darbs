# ConcertFinder

Mobilā lietotne (**React Native** + **Expo**), kas ļauj atrast gaidāmos mūzikas koncertus, izmantojot **Ticketmaster Discovery API** un **Biļešu Paradīzes** publisko API, saglabāt pasākumus kontā un saņemt **lokālu atgādinājumu** dienu pirms koncerta.

## Funkcionalitāte

- **Sākumlapa** — koncertu saraksts no Biļešu Paradīzes un, ja atļauta ģeolokācija, no Ticketmaster pēc lietotāja koordinātām (saraksts kārtots pēc datuma); atsvaidzināšana ar velkot uz leju.
- **Meklēšana un žanri** — teksta meklēšana (Ticketmaster + Biļešu Paradīze), žanru izvēle un ar žanru saistīts rezultātu saraksts.
- **Koncerta kartīte** — nosaukums, datums, vieta, attēls (kur pieejams), poga **Tickets** (atver biļešu URL).
- **Konts** — reģistrācija / pierakstīšanās / izrakstīšanās (**Firebase Authentication**), profila datu labošana; **saglabātie koncerti** (**Cloud Firestore**); viesa režīms bez konta.
- **Atgādinājums** — saglabājot koncertu, tiek mēģināts ieplānot **lokāls paziņojums** dienu pirms pasākuma (**expo-notifications**), ja ir atļauja un derīgs datums.

## Tehnoloģijas

- Expo ~54, React Native, React
- React Navigation (cilnes + native stack)
- Firebase (Auth, Firestore)
- expo-location, expo-notifications
- Jest / jest-expo (vienības testi)

## Priekšnosacījumi

- [Node.js](https://nodejs.org/) (LTS ieteicams)
- [npm](https://www.npmjs.com/) (nāk līdzi ar Node)
- **Expo Go** vai **izstrādes klients** (`expo-dev-client`) fiziskai ierīcei / emulātoram
- **Firebase** projekts ar ieslēgtu **Authentication** (e-pasts/parole) un **Cloud Firestore**

## Projekta iestatīšana

```bash
cd ConcertFinder
npm install
```

## Vides mainīgie (Firebase)

Izveido projekta saknē failu `.env` (Expo public prefikss `EXPO_PUBLIC_`):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Vērtības iegūst no Firebase konsoles: *Project settings → Your apps → SDK setup and configuration*.

Firestore drošības noteikumiem jāļauj autentificētam lietotājam lasīt/rakstīt savus datus (piem., kolekcija `users/{uid}/...`). Ja noteikumi nav uzstādīti, saglabāšana var atgriezt `permission-denied`.

## Palaišana

```bash
npm start
```

Tālāk Expo CLI norādēs QR kodu vai taustiņus Android / iOS / web palaišanai:

```bash
npm run android
npm run ios
npm run web
```

**Ģeolokācija** un **paziņojumi** pirmoreiz prasa lietotāja atļaujas ierīces dialogā.

## Testi

```bash
npm test
```

## Būve (EAS)

Projektā ir EAS konfigurācija (`eas.json`, `app.json`). Būvēšanai jābūt pieteikušies Expo kontā un jāseko [EAS Build](https://docs.expo.dev/build/introduction/) dokumentācijai.

## Ārējie API

- **Ticketmaster** — atslēga un pieprasījumi ir definēti `src/services/ConcertService.js`. Produkcijā ieteicams neatstāt API atslēgu repozitorijā; izmantot drošu glabāšanu vai starpniekserveri pēc savas drošības politikas.
- **Biļešu Paradīze** — publisks REST API norises vietu repertuāriem; URL un loģika tajā pašā servisa failā.

## Struktūra (īsumā)

| Ceļš | Apraksts |
|------|----------|
| `App.js` | Lietotnes sakne, navigācijas temats, `AuthProvider` |
| `src/navigation/` | Cilnes un stack navigācija |
| `src/screens/` | Ekrāni (sākums, meklēšana, žanru rezultāti, konts) |
| `src/components/` | Atkārtoti izmantojamas sastāvdaļas (piem., koncerta kartīte) |
| `src/services/` | Koncertu API, atgādinājumi |
| `src/context/` | Autentifikācijas konteksts |
| `src/firebase.js` | Firebase inicializācija |
