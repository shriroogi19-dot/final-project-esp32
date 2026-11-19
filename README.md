# ESP32 Alcohol Detection Dashboard (Vercel)

## Files and exact folder structure

Keep these at the GitHub repository root:

```
index.html
package.json
vercel.json
api/
  health.js
  send-sms.js
```

Do NOT put the API files in `api/api/`. The correct paths are `api/health.js` and `api/send-sms.js`.

## SMS provider setup (MSG91)

1. Create/configure an SMS Flow/Template in MSG91.
2. The example sends one dynamic template variable named `VAR1`. Configure your MSG91 template with that variable and ensure the text and variables match the approved template.
3. For India, complete required DLT registration, sender ID mapping and template approval before expecting delivery.
4. Get your MSG91 Authkey and Template/Flow ID.

MSG91 API docs: https://docs.msg91.com/en/sms/send-sms
Template help: https://msg91.com/help/template/how-to-create-flow-id-to-send-sms-via-api

## Vercel environment variables

Project → Settings → Environment Variables:

- `MSG91_AUTHKEY` = your MSG91 authkey
- `MSG91_TEMPLATE_ID` = your approved MSG91 template/flow ID
- `ACCESS_CODE` = optional dashboard API password. If set, enter the same value in the dashboard Access code box. If omitted, leave the box empty.

Never put the MSG91 authkey in frontend HTML, Arduino code, or GitHub. Redeploy after changing environment variables.

## Deploy

1. Upload/commit all files to the root of your GitHub repository.
2. Import/redeploy the repository in Vercel.
3. In Vercel Project Settings → General, Root Directory must be the repository root (the folder containing `index.html` and `api/`).
4. After deployment, open `https://YOUR-DOMAIN.vercel.app/api/health`.
5. With both MSG91 variables configured, expected response is `{"ok":true,"provider":"MSG91"}`. A 503 means configuration is missing. A 404 usually means the API folder is misplaced or Root Directory is wrong.

## Test SMS

1. Open the deployed site in Chrome/Edge on Windows.
2. Add your phone number.
3. Enter the optional access code only if you configured `ACCESS_CODE`.
4. Click Send test SMS.
5. Check Vercel Function Logs and MSG91 logs if rejected.

Phone numbers/settings/history are saved in the current browser's localStorage, not centrally in a database. Up to 10 recipients are accepted per request.

## ESP32 connection

The dashboard uses Web Serial. Pair ESP32 Bluetooth Classic on Windows, then select its outgoing Bluetooth COM port in the dashboard. Set baud rate to match the ESP32 Bluetooth serial connection (the sketch supplied in this project uses 115200). It recognizes lines containing `ALCOHOL DETECTED` / `ALCOHOL-MOTOR OFF` and `SAFE - MOTOR ON` / `SYSTEM SAFE`.

## Safety

This is a student prototype, not a certified breathalyser or vehicle immobilizer. Do not rely on it as the sole vehicle safety mechanism. Test the relay/motor circuit independently and safely.
