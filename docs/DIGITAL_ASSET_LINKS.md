# Digital Asset Links (Android TWA)

Digital Asset Links prove that **https://kulu.sites.bd** owns the Android app package.
When configured correctly, the KULU APK opens **full screen** (no Chrome URL bar).

## Files

| Path | Purpose |
|------|--------|
| `public/.well-known/assetlinks.json` | Served at `https://kulu.sites.bd/.well-known/assetlinks.json` |
| `vercel.json` | Serves `.well-known` as static JSON (not SPA `index.html`) |

## Package ID

Default package name used in this project:

```text
bd.sites.kulu
```

Use the **same** package ID in PWABuilder when you generate the Android package.

## Step-by-step setup

### 1. Generate the Android package

1. Open [https://www.pwabuilder.com](https://www.pwabuilder.com)
2. Enter `https://kulu.sites.bd`
3. **Package for stores** → **Android**
4. Set **Package ID** to: `bd.sites.kulu`
5. Download the ZIP

### 2. Get the SHA-256 certificate fingerprint

**Option A — from PWABuilder ZIP**

- Open the ZIP
- Look for signing / keystore notes, or a file that lists the **SHA256** fingerprint
- Copy the fingerprint (colon-separated hex, e.g. `AA:BB:CC:...`)

**Option B — from keystore with Java `keytool`**

```bash
keytool -list -v -keystore path/to/your.keystore -alias your-alias
```

Find the line **SHA256:** and copy the value.

**Option C — debug APK installed on a device**

```bash
# After installing the APK
adb shell pm get-app-links bd.sites.kulu
# or
keytool -printcert -jarfile app-release-signed.apk
```

### 3. Put the fingerprint in assetlinks.json

Edit `public/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "bd.sites.kulu",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:...your real fingerprint..."
      ]
    }
  }
]
```

- Use uppercase hex with **colons** between bytes (standard Android format).
- You can list **multiple** fingerprints (debug + release) in the array.

### 4. Deploy

Push to `main` so Vercel deploys. Confirm:

```text
https://kulu.sites.bd/.well-known/assetlinks.json
```

Must return **JSON** (not the React HTML app).

### 5. Verify

Google’s tester:

```text
https://developers.google.com/digital-asset-links/tools/generator
```

Or:

```text
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://kulu.sites.bd&relation=delegate_permission/common.handle_all_urls
```

### 6. Reinstall the APK

1. Uninstall the old KULU app from the phone
2. Install the APK again
3. Open KULU — it should be **full screen** (no URL bar)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| URL still shows browser bar | Fingerprint or package name mismatch; redeploy JSON; reinstall app |
| `assetlinks.json` returns HTML | SPA rewrite was catching the path — fixed in `vercel.json`; hard-refresh / wait for deploy |
| Wrong package name | Must match PWABuilder package ID exactly (`bd.sites.kulu`) |
| Multiple signing keys | Add every SHA-256 used (debug + Play App Signing) to the array |

## Play App Signing

If you publish on Google Play with **Play App Signing**, Google may re-sign the app.
Use the **App signing key certificate** SHA-256 from Play Console → **Setup → App integrity**, not only your upload key.

Add that fingerprint to `sha256_cert_fingerprints` as well.
