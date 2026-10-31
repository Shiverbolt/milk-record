# Milk Record

A daily milk-delivery log that works the way a paper record does, with the arithmetic done for you. Tap a day, pick how much came (¼ L steps or any amount), and see what you owe since the last payment.

## What it does

- **Calendar of deliveries**: each day fills like a glass, sized to the amount delivered, with fractional quantities such as ¾ L.
- **Automatic billing**: litres × your per-litre rate, grouped into cycles that each payment closes.
- **Bills for the milk seller**: one image per cycle, with a calendar of quantities, remarks and the paid-vs-owed summary, shared through Android's share sheet.
- **Remarks** on any day ("came late", "not delivered, festival").
- **Seasons**: every month has its own colours and a background animation (snow, petals, sun, rain, leaves), following Indian seasons.
- **Settings**: currency, usual daily quantity, theme, seasonal colours and animations, storage use, backup and restore, and clearing data by month, by year or all at once.

## What's in this repository

| Folder | What it is |
|---|---|
| [`demo/`](demo) | A browser demo of the app with sample data. Open `demo/index.html` or host the folder anywhere static. |
| [`app/`](app) | The Android app (Capacitor 8, targets Android 16). Everything is stored on the phone; no account, no network. |
| [`docker/`](docker) | A home-server version: a small Node server plus the page, so every device on your network shares one record. |
| [`milk-record.html`](milk-record.html) | The first version of the page, kept for reference. |

### Try it in your browser

[`demo/index.html`](demo/index.html) is the full app as a web page. It starts with about 80 days of sample deliveries, payments and remarks, dated relative to today. Anything you change stays in your own browser, and **Reset demo** brings the sample back.

Open the file directly, or serve the folder:

```bash
npx http-server demo
```

The demo is generated from the app's page, so it never drifts from the real thing. After changing `app/www/index.html`, run `npm run demo` in `app/` to refresh it.

### Android app

```bash
cd app
npm install
npm run build:debug      # test APK: android/app/build/outputs/apk/debug/
npm run build:release    # Play Store bundle (needs your signing key)
```

Needs JDK 21 and the Android SDK. Point to them in `app/android/local.properties`:

```
sdk.dir=C:\\path\\to\\Android\\Sdk
java.home=C:\\path\\to\\jdk-21
```

[`app/PLAY-STORE.md`](app/PLAY-STORE.md) walks through the signing key, the store listing and testing. The app's web code is a single file: [`app/www/index.html`](app/www/index.html).

### Home server (Docker)

```bash
cd docker
docker compose up -d --build
```

Then open `http://<your-PC's-IP>:8085` on any device on your network. Data lives in the `milk-record_milk-data` Docker volume, so it survives rebuilds.

## Data and privacy

The Android app keeps your record only on the phone. Backups are JSON files you save or share yourself. See [`app/privacy-policy.md`](app/privacy-policy.md).
