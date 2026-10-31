# Milk Record: from this folder to the Play Store

Everything needed to build is already installed on this PC:
- JDK 21 in `%LOCALAPPDATA%\milk-build-tools`
- Android SDK in `%LOCALAPPDATA%\Android\Sdk`

`android/local.properties` points at both (`sdk.dir` and `java.home`). It is machine-specific and kept out of git; on another PC, create it with those two lines. The commands below then work from a plain terminal in this folder.

## 1. Try it on your phone first

`Milk-Record-test.apk` is a debug build.

1. Copy it to your phone and open it. Android asks you to allow installs from your file manager; allow it once.
2. To bring in your history from June 11 to Oct 24, also copy `milk-record-backup.json` to the phone. In the app, tap **Restore backup** and pick the file.

## 2. Decide the package name (do this once, before the first upload)

The app id is `com.shiva.milkrecord`. Once you upload to Play, it can never change. To use another one, edit `appId` in `capacitor.config.json` plus `namespace` and `applicationId` in `android/app/build.gradle`.

## 3. Create your upload key (once)

Play needs every release signed with your own key. Run this in this folder and choose your own passwords when it asks:

```
"%LOCALAPPDATA%\milk-build-tools\jdk-extract\jdk-21.0.12.1+1\bin\keytool" -genkeypair -v -keystore android\milk-record-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Then create `android\keystore.properties` with:

```
storeFile=milk-record-upload.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
```

Back up the `.jks` file and both passwords somewhere safe, such as a password manager. If you lose them, you can ask Google to reset the upload key, but it takes days. Both files are already in `.gitignore`.

## 4. Build the release bundle

```
npm run build:release
```

The bundle lands at `android\app\build\outputs\bundle\release\app-release.aab`. That is the file you upload.

## 5. Play Console

1. Create a developer account at play.google.com/console. It costs a one-time US$25 fee and requires ID verification.
2. **Create app**: name "Milk Record", type App, free.
3. **Store listing**: use the files in `assets\`:
   - App icon: `play-store-icon-512.png`
   - Feature graphic: `play-store-feature-1024x500.png`
   - Phone screenshots: take 2 to 8 on your phone after installing the test APK.
   - Short description example: "Log daily milk in ¼-litre steps and see what you owe."
4. **App content**:
   - Privacy policy: host `privacy-policy.md` anywhere public (GitHub Pages, Google Sites) and paste the URL. Add your email address to it first.
   - Data safety: the app collects and shares no data.
   - Ads: none. Content rating: complete the questionnaire (everything "No"). Target audience: 18+.
5. **Testing**: personal developer accounts created after November 2023 must run a closed test with at least 12 testers for 14 days before they can publish to Production. Upload the `.aab` to **Closed testing**, add testers by email, and apply for Production when the 14 days are up.

## Releasing an update

1. Edit `www/index.html`.
2. Raise `versionCode` (1 → 2 → 3…) and `versionName` in `android/app/build.gradle`.
3. Run `npm run build:release` and upload the new `.aab`.

To change the icon or splash, edit `scripts/make-icons.mjs` and run `npm run icons`.
