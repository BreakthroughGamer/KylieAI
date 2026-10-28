# Kylie AI — Early Access Page

A single-page waitlist site. Signups go into a Google Sheet you own. It's free to host, needs no build step, and has no dependencies.

- `index.html`: the whole site (styles and script are inline)
- `google-apps-script/Code.gs`: the backend that writes signups to the Google Sheet

## 1. Connect the form to a Google Sheet (about 5 min)

1. Create a new Google Sheet (name it something like "Kylie AI Waitlist").
2. Go to **Extensions → Apps Script**, delete the starter code, paste in `google-apps-script/Code.gs`, and save.
3. Click **Deploy → New deployment**, set the type to **Web app**, and choose:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, approve the permission prompt, and copy the **Web app URL** (it ends in `/exec`).
5. In `index.html`, paste it into:
   ```js
   const SIGNUP_ENDPOINT = 'https://script.google.com/macros/s/XXXX/exec';
   ```

Each signup adds a row to a `Signups` tab: timestamp, email, chat, image, video, notes, referrer, and UTM tags. Duplicate emails are skipped.

While `SIGNUP_ENDPOINT` is empty the page runs in **demo mode**: the form works, but it shows a yellow "not saved" note and nothing is stored.

## 2. Put it online with GitHub Pages (free)

```sh
git add .
git commit -m "Early access landing page"
git push -u origin main
```

Then on GitHub, open the repo and go to **Settings → Pages → Build and deployment**. Set Source to **Deploy from a branch**, the branch to **main**, the folder to **/ (root)**, and save. After a minute or so the site is live at:

**https://breakthroughgamer.github.io/KylieAI/**

> GitHub Pages on a free account requires the repo to be **public**. If you want it private, connect the repo to Netlify or Cloudflare Pages instead. Both are free and need no settings (no build command, publish directory `/`).

## Tracking where signups come from

Add UTM tags to the links you share, and they'll show up in the sheet:

```
https://breakthroughgamer.github.io/KylieAI/?utm_source=tiktok&utm_campaign=launch
```

## Customizing

- **Colors:** edit the variables at the top of the `<style>` block (`--accent-1`, `--accent-2`, `--bg`, and so on).
- **Logo:** the header logo and favicon both use `assets/logo/logo-a-heart-k-v2.svg`. Other concepts and a side-by-side preview are in `assets/logo/` (open `preview.html`).
- **Copy:** the hero, feature cards, and FAQ are plain HTML.
- **Character cards:** edit the `CHARACTERS` list near the bottom of `index.html` (name, age, style, vibe, tags). To add a portrait, save it at the card's `img` path, for example `assets/chat/kylie-photo.jpg`, ideally in a 3:4 ratio. Until an image exists, the card shows a colored placeholder. Cards marked `locked: true` show a "More girls coming soon" lock instead; give one an `img` and remove `locked` to open it up.

## Updating the Apps Script

After you change `Code.gs`, paste it into the script editor again, then go to **Deploy → Manage deployments → ✏️ Edit**, set **Version: New version**, and click **Deploy**. The `/exec` URL stays the same. If you skip this step, the old script keeps running and silently drops any new fields.

## Custom domain later

Buy a domain, then add it under **Settings → Pages → Custom domain** and create the DNS record GitHub shows you. The form keeps working because the Apps Script URL doesn't change.
