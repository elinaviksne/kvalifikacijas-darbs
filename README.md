# Kvalifikācijas darbs

Repozitorijs satur **mobilās lietotnes ConcertFinder** izstrādi un **lietotāja saskarnes idejas** (plūsmas, ekrānu apraksti).

## Mapes

| Mape | Saturs |
|------|--------|
| [**ConcertFinder**](ConcertFinder/) | React Native (Expo) lietotnes kods: koncertu meklēšana, žanri, Firebase konts, saglabātie koncerti, atgādinājumi. |
| [**UI ideas**](UI%20ideas/) | UI / UX idejas un ekrānu plānošanas materiāli. |

## Ātrā palaišana (lietotne)

Pilna instalācija, Firebase vides mainīgie, testi un API piezīmes ir aprakstīti šeit:

**[ConcertFinder/README.md](ConcertFinder/README.md)**

Īsumā:

```bash
git clone https://github.com/elinaviksne/kvalifikacijas-darbs.git
cd kvalifikacijas-darbs/ConcertFinder
npm install
npm start
```

Pirms `npm start` izveido `ConcertFinder/.env` ar Firebase `EXPO_PUBLIC_*` vērtībām (sk. detalizēto README mapē `ConcertFinder`).
