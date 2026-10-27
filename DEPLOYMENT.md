# Deploying SPECTRA Exhibition Passport — 100% free, runs from GitHub

This app is a **fully client-side PWA** — no database, no backend server.
Everything (visitor details, stamps, certificates) lives in each visitor's
own phone browser. That means it can be hosted completely free using
**GitHub Pages** — your app will run directly from your GitHub account with
a permanent link, and automatically redeploys every time you push a change.

I've already set this up for you:
- `.github/workflows/deploy-pages.yml` — builds and publishes the app automatically
- `next.config.ts` — supports both normal mode and GitHub Pages' static mode
- All QR code links on `/admin` automatically point to wherever the app is running

You just need to push the code to your own GitHub account and flip one
switch in the repo settings. Takes about 5 minutes.

---

## ✅ If you just fixed `.github/workflows/deploy-pages.yml` and now see "no index.html" / still 404

This is good news — it means the previous problems (flattened folders,
dot-folder upload restriction) are behind you. This specific symptom means
**the workflow hasn't successfully produced a built site yet**, which is
the very next and final link in the chain. Go through this in order:

**1. Go to your repo's "Actions" tab right now.** Committing the new
`.github/workflows/deploy-pages.yml` file should have triggered a run
automatically within a few seconds of that commit. Do you see a run at the
top of the list?

→ **If there's no run at all:** the workflow still isn't being detected.
Double-check the file is at the EXACT path `.github/workflows/deploy-pages.yml`
(not `.github/workflow/` singular, not `.Github/`, capitalization matters
on the folder names too). Also try: Actions tab → click the workflow's name
on the left sidebar → **"Run workflow"** button → this manually triggers it
using the `workflow_dispatch` trigger already built into the file,
regardless of whether the push-trigger fired.

→ **If there's a run, click into it.** You'll see two jobs: **`build`** and
**`deploy`**.

**2. Is the `build` job green ✓?**

→ **If `build` is red ❌:** click on it to expand its steps and find the
one with a red X. Our workflow prints a specific, readable error message
for the most common failure causes (missing files, missing
`package-lock.json`, etc.) — read that message and look for it in the
Troubleshooting sections below. If you're not sure what it means, copy the
exact error text and ask for help with it directly.

**3. Is the `deploy` job green ✓ (not just `build`)?**

→ **If `deploy` is red, grey, or missing:** this means **Settings → Pages
→ Source** isn't set to **"GitHub Actions"** (it may have reset, or wasn't
actually saved earlier). Go check that setting now, fix it if needed, then
come back to this same run and click **"Re-run all jobs"** (top-right of
the run page) — you don't need to commit anything again.

**4. Once BOTH `build` and `deploy` show green ✓**, wait about 60 seconds
(GitHub Pages takes a short moment to actually start serving a fresh
deployment), then do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) on your
site's URL before concluding anything is still wrong.

**If you've checked all 4 and it's still not working, send:**
- A screenshot of your **Actions tab**, with the latest run opened so both
  the `build` and `deploy` job statuses are visible
- If `build` failed, a screenshot of the **specific red step's expanded
  log** (not just the job summary — click into the actual failing step)

---

## 🚦 START HERE if you're seeing a 404 right now

Answer these questions **in order** by actually looking at your GitHub
repo — stop at the first "no" and fix that one thing before checking
anything else. Most people getting stuck in a loop are jumping between
causes instead of verifying each one in sequence.

**0. Are you looking at the `main` branch right now?**
Look at the branch dropdown button on your repo's file-listing page (it has
a little branch icon 🔀 and usually says `main`). GitHub's upload page has
a setting at the bottom — a choice between **"Commit directly to the `main`
branch"** and **"Create a new branch for this commit and start a pull
request"** — right above the green "Commit changes" button. **If that
second option was selected (sometimes it's the pre-selected default),
your corrected files were saved onto a brand-new side branch, NOT onto
`main`.**

This matters a lot here, because:
- Our GitHub Actions workflow only auto-triggers on pushes to **`main`**
  (see `on: push: branches: ["main"]` in `deploy-pages.yml`).
- The "Deploy from a branch" Pages settings (if ever used) also only look
  at `main`.
- So if your correctly-structured upload actually landed on a different
  branch (e.g. one auto-named something like
  `your-username-patch-1`), **`main` itself might still contain the OLD,
  broken/flattened files** (or nothing useful at all) — explaining why
  you're still seeing 404 despite the upload looking correct when you
  checked it (you were likely looking at the new branch, not `main`).

**How to check and fix:** click the branch dropdown on your repo page and
see every branch listed. If you find your files sitting on a branch that
isn't `main`, either:
- Open a **Pull Request** from that branch into `main` and merge it
  (GitHub will prompt you to do this automatically after a web upload that
  created a branch — look for a yellow banner on your repo's main page), or
- Redo the upload, making sure to select **"Commit directly to the `main`
  branch"** this time before clicking "Commit changes."

After merging/redoing onto `main`, go to the **Actions** tab — a fresh
workflow run should start automatically within a few seconds.

**1. Open your repo's main page on github.com, while on the `main` branch
(per question 0 above). Do you see a `src` folder and a `public` folder
listed (not loose `.tsx`/`.ts` files)?**
→ If NO: your upload flattened the folder structure — almost certainly
because you clicked **"choose your files"** on GitHub's upload page, which
opens a file-picker dialog that **can never upload folders, no matter how
you select inside it** (this is a hard limitation of all file pickers, not
something you did wrong). **At this point, please just use GitHub Desktop**
(Option A in the **"Uploading via the GitHub website"** section below) — it
has no file-picker or drag-and-drop step at all, so this problem literally
cannot happen with it. Nothing else matters until this is fixed.

**2. Click into `.github` → `workflows`. Do you see exactly one file named
`deploy-pages.yml` there?**
→ If NO, and you've tried dragging the `.github` folder in without success
(or GitHub says there's nothing to commit): **this is a confirmed GitHub
limitation, not something you're doing wrong** — the web upload page
rejects any folder whose name starts with a dot. See **"Confirmed GitHub
limitation: the web upload page REJECTS folders starting with a dot"**
below for the fix (use GitHub Desktop, or the rename-then-fix workaround).

**3. Click your repo's "Actions" tab. Do you see a workflow run with a name
you recognize (not a "pick a template" screen, and not only runs called
"pages build and deployment")?**
→ If you see a template picker: the workflow file isn't being detected —
revisit question 2.
→ If you only see "pages build and deployment" runs: your Pages Source
setting is still on the old default — see the "two different workflow
names" section under Troubleshooting below.
→ If you see a run of your own workflow with a red ❌: click into it,
read the error message, and find it in the Troubleshooting section below.

### 📋 Confirmed example: "flattened repo" + "Source = Deploy from a branch" together

This exact combination has come up before and is worth calling out
specifically, because the symptoms can look confusing together:

- Repo's main page shows loose files (no `src`/`public`/`.github` folders).
- Settings → Pages → Source shows **"Deploy from a branch"**, branch `main`,
  folder `/(root)`.
- The **Actions** tab only shows runs named **"pages build and
  deployment"**, triggered **"via dynamic"**, which show green ✓ and a
  "Success" status, and even list a `deploy` step with your real Pages URL.

**This will still 404 despite all those green checkmarks.** Here's why:
"Deploy from a branch" is GitHub's legacy mode — it takes whatever is
sitting in your repo (at the `/(root)` folder, on the `main` branch) completely
as-is and tries to publish it directly, running it through Jekyll (GitHub's
default static-site tool) along the way. It has no concept of Next.js, no
build step, and no understanding that `src/app/page.tsx` needs to be
compiled into an `index.html` file. If your repo's root doesn't already
contain a ready-made `index.html`, this legacy pipeline can "succeed" at
publishing... nothing useful, which is exactly why you still see 404 even
though its run shows green.

**This means our actual GitHub Actions workflow (`deploy-pages.yml`) never
even gets a chance to run**, because Source isn't set to "GitHub Actions" —
so there's no sign of a failed/red workflow anywhere, which is also
confusing (there's nothing to point at except a "successful" but
irrelevant pipeline).

**The fix requires doing BOTH of these, not just one:**
1. Fix the flattened repo structure (see question 1 above / the upload
   section below) so `.github/workflows/deploy-pages.yml`, `src/`, and
   `public/` genuinely exist in your repo.
2. **Only after that's done**, go to **Settings → Pages → Source** and
   change the dropdown from "Deploy from a branch" to **"GitHub Actions"**.
   (Changing this *before* fixing the structure will just show build errors
   from our workflow instead, since it depends on `src/`, `public/`, etc.
   actually being present — fix the structure first.)

**4. Open that same run. Do BOTH the `build` job AND the `deploy` job show
a green ✓ (not just `build`)?**
→ If `deploy` is red, missing, or grey: go to **Settings → Pages → Source**
and make sure it says **"GitHub Actions"**, then go back to the run and
click **"Re-run all jobs"**.

**5. Go to Settings → Pages. Does it show "Your site is live at..." with a
URL, and does that URL include your repository name
(`https://username.github.io/repo-name/`) — and are you typing that
**exact** URL, including the trailing slash and matching capitalization?**
→ If the URL is missing the repo name, or you're typing it differently,
that mismatch alone causes a 404. Also wait 60 seconds and hard-refresh
(Ctrl+Shift+R) after a fresh deploy before concluding it's still broken.

If you've verified all 5 and it's still 404, reply with:
- A screenshot of your repo's **main file list** (question 1)
- A screenshot of your **Actions tab** (question 3)
- The **exact URL** you're typing into your browser (question 5)

---

## Step 1 — Create a GitHub repository

1. Go to **https://github.com/new**
2. Name it anything you like, e.g. `spectra-exhibition`
3. Leave it empty (don't add a README/license) → click **Create repository**

## Step 2 — Push this project to your new repository

From a terminal in this project folder:

```bash
git remote add origin https://github.com/<your-username>/spectra-exhibition.git
git branch -M main
git push -u origin main
```

(If asked for a password, GitHub requires a **Personal Access Token** instead
of your account password — create one at
github.com → Settings → Developer settings → Personal access tokens.)

### ⚠️⚠️ Read this carefully — the #1 mistake people make with web upload

This project has files nested **several folders deep**
(e.g. `src/app/page.tsx`, `src/components/PassportCard.tsx`,
`.github/workflows/deploy-pages.yml`). GitHub's drag-and-drop upload is
capable of preserving that nested structure perfectly — **but only if you
drag the FOLDERS themselves**, not individual files you've opened and
grabbed from inside them.

**The mistake to avoid:** opening `src`, then opening `app` inside it, then
selecting every individual `.tsx`/`.ts` file one by one and dragging those —
this throws away all the folder structure and dumps every file flat into
your repo's root (e.g. `page.tsx`, `layout.tsx`, `schema.ts`,
`PassportCard.tsx` all sitting loose next to `package.json`, with no `src`
folder at all). **This will always produce a 404** — Next.js has no way to
find your pages if `page.tsx` isn't inside `src/app/`.

```
❌ WRONG — individual files dragged in, structure lost:
your-repo/
  ├── package.json
  ├── page.tsx              ← should be src/app/page.tsx
  ├── layout.tsx            ← should be src/app/layout.tsx
  ├── PassportCard.tsx      ← should be src/components/PassportCard.tsx
  ├── schema.ts             ← should be src/db/schema.ts
  ├── deploy-pages.yml      ← should be .github/workflows/deploy-pages.yml
  └── ... (everything flattened)

✅ CORRECT — whole folders dragged in, structure preserved:
your-repo/
  ├── package.json
  ├── next.config.ts
  ├── .github/
  │     └── workflows/
  │           └── deploy-pages.yml
  ├── public/
  │     ├── icon.svg
  │     └── sw.js
  └── src/
        ├── app/
        │     ├── page.tsx
        │     ├── layout.tsx
        │     └── ...
        ├── components/
        │     └── PassportCard.tsx (and others)
        ├── db/
        │     └── schema.ts (and index.ts)
        └── lib/
              └── branding.ts (and others)
```

### ⚠️⚠️⚠️ Confirmed GitHub limitation: the web upload page REJECTS folders starting with a dot

If you've been trying to drag in the `.github` folder specifically and
nothing happens (or GitHub says there's nothing to commit), **this is not
something you're doing wrong — it's a documented bug/limitation in GitHub's
own web upload page.** GitHub's browser-based uploader treats any file or
folder whose name starts with a dot (like `.github`, and sometimes
`.gitignore`, `.nvmrc`, `.node-version`) as a "hidden file" and silently
refuses to include it, even though these are completely normal, intended
files — this has been reported directly to GitHub by other users hitting
the exact same wall ("I tried uploading a directory called '.github' and it
says 'This file is hidden' and won't continue").

**This means the web upload page (drag-and-drop OR the file picker) can
never reliably get `.github/workflows/deploy-pages.yml` into your repo.**
You need one of the two fixes below.

### ✅ Option A (strongly recommended): use GitHub Desktop instead

GitHub Desktop does **not** have this dot-folder restriction at all — it
uses Git directly under the hood, which has no concept of "hidden files"
the way a browser upload widget does. This is now the clearly best path
given everything encountered so far:

1. Download and install **GitHub Desktop**: https://desktop.github.com
2. Open it and sign in with your GitHub account.
3. **File → Add Local Repository** → browse to and select your extracted
   project folder (e.g. `school-exhibition-pwa-development`) → if it says
   "this directory does not appear to be a Git repository," click
   **"create a repository here instead"**.
4. You'll see a list of every file to be committed, with its **real, full,
   nested path** shown (e.g. `src/app/page.tsx` AND
   `.github/workflows/deploy-pages.yml`) — this is your chance to visually
   confirm nothing is flattened or missing, dot-folders included.
5. Type a commit message at the bottom-left (e.g. "Initial commit") and
   click **Commit to main**.
6. If you already have a repository on GitHub.com: go to **Repository menu
   → Repository Settings → Remote**, paste your existing repo's URL, then
   use **Repository → Push** to upload. If you're starting fresh, click
   **"Publish repository"** at the top instead.
7. GitHub Desktop uploads everything — including `.github` — with the
   exact folder structure preserved, with zero dot-folder or
   drag-and-drop ambiguity at all.

### Option B: web upload workaround (if you really can't use GitHub Desktop)

⚠️ **Update:** the "rename using `../` in the filename field" trick
described in earlier guidance can fail with *"That path contains a
malformed path component"* on current GitHub — the editor doesn't always
resolve a pasted `../../` sequence the way it does when typed character by
character. **Use this more reliable method instead**, which creates a
brand-new file at the correct path directly, rather than trying to rename
an existing one:

1. First, get the correct file content onto your clipboard. You already
   have a perfectly correct copy of this file sitting in your repo (it
   uploaded fine as real file content — only its *location* is wrong). On
   GitHub, navigate to it: `github` folder → `workflows` folder →
   `deploy-pages.yml`.
2. Click the **"Raw"** button (top-right area of the file view, next to the
   copy/download icons) — this opens the file as plain, unformatted text in
   your browser.
3. Press **Ctrl+A** (select all) then **Ctrl+C** (copy) on that raw text
   page. Copying from this raw view guarantees the text is byte-for-byte
   identical with no hidden formatting changes.
4. Go back to your repository's main page and click **Add file → Create new
   file**.
5. In the **"Name your file..."** box at the top (this one is empty/fresh,
   not derived from an existing file, so it accepts a full path typed from
   scratch), type exactly:
   ```
   .github/workflows/deploy-pages.yml
   ```
   Typing the `/` characters here makes GitHub create the `.github` and
   `workflows` folders for you automatically — and because this is a brand
   new file being created (not a rename of an existing one), GitHub accepts
   the leading dot without issue; the dot-folder restriction only applies
   to the upload/drag-and-drop widget, not to typing a path here.
6. Click into the large text area below the filename box and press
   **Ctrl+V** to paste the content you copied in step 3.
7. Scroll down, make sure **"Commit directly to the `main` branch"** is
   selected, and click **"Commit changes..."**.
8. Go back to your repo's main page and confirm you now see a **`.github`**
   folder (with the dot) containing `workflows/deploy-pages.yml`.
9. **Clean up the old misplaced copy:** navigate to the old
   `github/workflows/deploy-pages.yml` (without the dot), click the 🗑️
   trash/delete icon in the top-right of its file view, and commit that
   deletion too. (Leaving it there doesn't break anything — GitHub Actions
   only looks at `.github/workflows/`, it just ignores the other folder —
   but it's tidier to remove it.)

This only needs to be done once, for this one folder — nothing else in the
project starts with a dot except `.gitignore`, `.node-version`, and
`.nvmrc`, which are optional/non-critical for GitHub Pages to work (see
notes on each further down), so you don't need to repeat this for those
unless you want full parity with the original project.

### Option C: web upload, done correctly (for everything else besides `.github`)

⚠️⚠️⚠️ **Critical distinction — GitHub's upload page actually offers TWO
completely different ways to add files, and only ONE of them can preserve
folders:**

| Method | Can upload folders? |
|---|---|
| Clicking **"choose your files"** (opens your OS's file picker / Open dialog, the same window you get from "File → Open" in any app) | **NO — never.** This dialog is only capable of selecting and returning individual files, even if you can see/click folders inside it. Selecting everything with Ctrl+A inside this dialog and clicking "Open" will silently flatten every folder, every single time — this is a hard limitation of how file picker dialogs work in every browser, not a mistake you can avoid by selecting differently inside it. |
| **Dragging** files/folders from an open **File Explorer / Finder window** directly onto the dotted drop-zone area on GitHub's upload page | **YES.** This is the only web-based method that preserves folder structure. |

**If you clicked "upload files" and then a dialog box popped up letting you
browse and select — that was the file picker, and that is exactly why your
folders keep disappearing.** This is not something you did wrong by
selecting the wrong items; it's simply impossible to upload folders through
that dialog, no matter how you select inside it.

**Here is the correct drag-and-drop process, step by step:**

1. On your repo's GitHub page, click **Add file → Upload files**. You'll
   land on a page with a large dashed-border box saying "Drag files here to
   add them to your repository."
2. **Do NOT click "choose your files" on that page.** Leave that browser
   tab/window open and visible.
3. Separately, open a **File Explorer window** (Windows key + E, or however
   you normally open it) and navigate to your extracted project folder.
   You should see these top-level items: folders `.github`, `public`,
   `src`, and files `.gitignore`, `.node-version`, `.nvmrc`,
   `DEPLOYMENT.md`, `drizzle.config.json`, `eslint.config.mjs`,
   `next.config.ts`, `package.json`, `postcss.config.mjs`, `tsconfig.json`,
   `vercel.json`.
4. **Resize/position the File Explorer window and the browser window so you
   can see both at the same time** (e.g. snap one to the left half of your
   screen and the browser to the right half — on Windows you can drag a
   window's title bar to the edge of the screen to do this automatically).
5. In the File Explorer window, click on empty space first, then press
   **Ctrl+A** to select everything (this selects the folders themselves,
   not their contents — don't double-click/open any folder first).
6. **Click and hold** on any one of the selected items, then **drag your
   mouse across into the browser window**, directly over the dashed
   drop-zone box, and **release the mouse button** there.
7. GitHub will show a preview list of what's about to be uploaded — look
   for entries showing folder paths like `src/app/page.tsx` or
   `.github/workflows/deploy-pages.yml` (not just `page.tsx` alone) to
   confirm folders were picked up correctly before committing.
8. Scroll down, add a commit message, and click **Commit changes**.
9. Afterwards, open your repository's page and confirm `package.json`,
   `next.config.ts`, **a `src` folder** (not individual `.tsx` files), and
   **a `public` folder** are visible at the top level — if you instead see
   loose `.tsx`/`.ts` files sitting next to `package.json` with no `src`
   folder, the drag didn't register correctly — try again, or switch to
   Option A (GitHub Desktop) above, which has no drag-and-drop step at all
   and is far less finicky.

**If dragging from File Explorer to the browser feels awkward or doesn't
work on your system** (this can be fiddly on some Windows setups,
especially with multiple monitors or maximized windows), **please just use
Option A (GitHub Desktop) instead** — it has no drag-and-drop or file
picker step at all, so this entire class of problem cannot happen with it.

### If you already uploaded a flattened repo (fixing it without starting over)

The fastest fix is usually to **delete every file in the broken repo and
re-upload correctly** rather than trying to manually move dozens of files
one by one through the website:

1. On your repo's main page, select all files (if there's a selection
   checkbox) or delete them one-by-one/via **Settings → scroll to the
   bottom → Delete this repository**, then create a fresh empty repository
   with the same name.
2. Follow **Option A** (GitHub Desktop) above for a guaranteed-correct
   upload this time.

**Note about `package-lock.json`:** this file is sometimes excluded from
project exports/zips. It is *not required* — the included GitHub Actions
workflow automatically detects if it's missing and falls back to a slightly
slower but fully working install method. You do not need to create it
yourself, though if you ever run `npm install` on your own computer it will
generate one, which you're welcome to commit for faster future builds.

### ⚠️ Verify the `.github/workflows/deploy-pages.yml` file actually uploaded

This is the single most important file for GitHub Pages deployment, and it's
also the easiest one to accidentally skip during a drag-and-drop upload,
because `.github` is a "dot folder" (hidden-style name) that some upload
flows silently drop.

**How to check:** on your repository's GitHub page, look for a folder named
`.github` in the file list. Click into it, then into `workflows` — you
should see a file called `deploy-pages.yml`. If `.github` isn't there at
all, or the `Actions` tab only shows template suggestions (like "Jekyll
using Docker image", "Deno", "Webpack" etc.) instead of a run of your own
workflow, **this file is missing and needs to be added** — that
template-picker screen is GitHub's way of saying "I don't see any workflow
file in this repo yet."

### ✅ The reliable way to add it: upload the real file, don't retype it

**Important: you already have this exact file on your computer** — it was
included in the project .zip you downloaded, at
`.github/workflows/deploy-pages.yml` inside the extracted folder. **Do not
manually type or copy-paste its contents into GitHub's text editor** — that
text box can silently convert straight quote characters (`"`) into curly
"smart quotes" (`"` `"`), which looks identical to the eye but breaks YAML
parsing with an error like *"You have an error in your yaml syntax on line
31"*. Uploading the actual file instead completely avoids this, since no
text re-typing/copying is involved.

**Steps:**

1. On your computer, open the extracted project folder and navigate into
   the `.github` folder, then the `workflows` folder inside it. You should
   see `deploy-pages.yml` sitting there as a real file.
2. On your GitHub repository's page, click **Add file → Upload files**.
3. Drag `deploy-pages.yml` from that `.github/workflows/` folder straight
   into the upload area. GitHub will show a text box above it asking where
   to put it — type `.github/workflows/` into that path box so the file
   lands in the correct folder (GitHub will create `.github` and `workflows`
   automatically if they don't already exist in your repo).
4. Scroll down, add a commit message like "Add GitHub Pages workflow", and
   click **Commit changes...** → **Commit directly to the `main` branch**.
5. Go to the **Actions** tab — a new run should start automatically within a
   few seconds.

**If you already created a broken version by typing/pasting it manually:**
delete that file first (open it on GitHub → trash can icon in the top-right
→ commit the deletion), then follow the upload steps above to replace it
with the real, untouched file.

**If you really do need to copy-paste instead of upload** (e.g. you no
longer have the original extracted folder), always copy from the file's
**raw** view, never its rendered/preview view: open the file on GitHub,
click the **Raw** button, select-all and copy from that plain-text page —
raw views don't apply any text formatting, so quote characters stay exactly
as typed and won't get corrupted.

## Step 3 — Turn on GitHub Pages for this repository

⚠️ **This step must be done before the workflow's `deploy` job can succeed.**
If you already pushed/created the workflow file and a run happened before
doing this step, that run's `deploy` job almost certainly failed (even if
the `build` job looked fine) — which is the single most common reason for
seeing a 404 even after "everything looked right." If that's your
situation, do this step now, then skip to **Step 4** and **re-run** the
workflow (instructions below) — you do not need to push anything again.

1. On GitHub, open your repo → **Settings** tab → **Pages** (left sidebar).
2. Under **"Build and deployment"** → **Source**, choose **"GitHub Actions"**
   (if it already shows "GitHub Actions" as selected, that's fine — it means
   this step was already done).
3. That's it — no further configuration needed. The workflow in
   `.github/workflows/deploy-pages.yml` already knows what to do.

## Step 4 — Watch it deploy

1. Go to the **Actions** tab of your repo. You'll see a list of workflow
   runs, each named **"Deploy to GitHub Pages"**. Click the **most recent**
   one (top of the list).
2. You'll see **two jobs** listed on the left side of that run: **`build`**
   and **`deploy`**. Both must show a green ✓. If either shows a red ❌,
   click directly on that job's name to expand its steps and find the one
   that failed — the log now prints a clear, specific error message
   explaining exactly what's wrong and how to fix it (see Troubleshooting
   below).
3. **If the `deploy` job shows a red ❌ or is missing entirely:** this
   almost always means Step 3 above (enabling "GitHub Actions" as the Pages
   source) wasn't done yet at the time this run happened. Go do Step 3 now
   if you haven't, then come back to this same run and click the **"Re-run
   all jobs"** button (top-right of the run page) — you do not need to push
   any code again, the same build will simply be deployed this time.
4. Once the `build` job finishes, open its **"Print the exact URL..."** step
   (or scroll to the run's **Summary** page) — it prints the exact address
   to open, for example:
   ```
   https://<your-username>.github.io/spectra-exhibition/
   ```
5. Only once **both** `build` and `deploy` show green ✓ is the site actually
   live. Go to **Settings → Pages** — you'll see that same URL at the top
   with a "Your site is live at..." message and a visit button. This is your
   **permanent** public link — it does not expire, and keeps working for the
   exhibition and beyond.

   ⚠️ **Important:** this URL always includes your repository name as a
   path segment and a trailing slash, e.g.
   `https://your-username.github.io/spectra-exhibition/` — NOT just
   `https://your-username.github.io/`. Opening the address without the
   repo name is one of the most common causes of a GitHub Pages 404.

6. GitHub Pages can take **30–90 seconds** to actually serve a brand new
   deployment even after `deploy` turns green — if you still see 404
   immediately after, wait a minute and do a hard refresh
   (Ctrl+Shift+R / Cmd+Shift+R) before assuming something is wrong.

## Step 5 — Generate & print your QR codes

1. Open `https://<your-username>.github.io/spectra-exhibition/admin` on your
   phone or computer.
2. The QR codes are generated **automatically for this exact URL** — no
   manual typing needed, because the admin page already knows its own
   deployed address.
3. Tap **"🖨️ Print All QRs"** to print all 7 codes (1 entry gate + 6 zones),
   or use **"⬇️ Download This QR (PNG)"** under any individual code if you'd
   rather paste it into a poster/Canva design/Word doc.
4. Place the Entry Gate QR at your school's main entrance, and the six zone
   QR codes at their matching exhibition stations.

## Step 6 — Open it on your phone

Open `https://<your-username>.github.io/spectra-exhibition/` in **Chrome**
(Android) or **Safari** (iPhone). Optionally tap **"Add to Home Screen"** so
it behaves like an installed app icon.

Now, when any visitor scans the Entry Gate QR code with their own phone
camera, it opens that same link directly in their browser and takes them
straight to the registration form — exactly as you wanted.

## Updating the app later

Whenever you want to change text, colors, or station names:

```bash
# 1. Edit files, e.g. src/lib/branding.ts or src/lib/stations.ts
# 2. Commit and push:
git add -A
git commit -m "update branding"
git push
```

GitHub Actions automatically rebuilds and redeploys within ~1–2 minutes —
no manual steps, no re-uploading, nothing else to configure.

## Custom domain (optional)

If your school has its own domain (e.g. `advancedacademyindore.com`), you can
point a subdomain like `spectra.advancedacademyindore.com` at your GitHub
Pages site for free — see GitHub's guide: Settings → Pages → Custom domain.

## Troubleshooting: GitHub Pages shows "404 — File not found"

This page is served directly by GitHub (not by this app), so it means one of
the things below. Go through these in order.

### 🔎 Zero, check your repo's file list for a flattened structure

Open your repository's main page on github.com. Do you see a **`src`
folder** and a **`public` folder** listed? Or do you instead see individual
files like `page.tsx`, `layout.tsx`, `schema.ts`, `PassportCard.tsx`,
`deploy-pages.yml` etc. sitting loose at the top level, with no `src` or
`.github` folder at all?

If it's the second case, your upload **flattened every nested folder into
one flat list** — this is a very common outcome of selecting individual
files from inside subfolders and dragging those, instead of dragging the
subfolders themselves. The build will fail (or, in some cases, GitHub's
legacy Jekyll pipeline will "succeed" at publishing the wrong thing, which
still produces this 404). See the **"Uploading via the GitHub website"**
section earlier in this guide for the exact fix (the GitHub Desktop method
is the most reliable way to redo this correctly).

### 🔎 First, check your Actions tab for TWO different workflow names

If your **Actions** tab (left sidebar, under "Workflows") shows **two
separate entries** — one named after your workflow file (e.g. **"Create
deploy-pages.yml"** or **"Deploy to GitHub Pages"**) and a completely
different one called **"pages build and deployment"** — this is a very
specific, very common situation with a clear fix:

- **"pages build and deployment"** is **GitHub's own legacy, automatic
  pipeline** (it builds your repo with Jekyll, GitHub's older default static
  site generator). It has nothing to do with this project's workflow, and
  it does **not** know how to build a Next.js app — so even if it shows a
  green ✓, it is deploying the *wrong thing* (raw source files, not your
  built app), which is exactly why you'd still see a 404 or a broken page.
- This pipeline **only runs automatically when Settings → Pages → Source is
  still set to "Deploy from a branch"** instead of "GitHub Actions". Seeing
  many runs of it (especially ones that succeeded) is strong proof that
  setting hasn't been switched yet.
- Meanwhile, your own workflow (**"Create deploy-pages.yml"** / "Deploy to
  GitHub Pages") is the one that actually builds this Next.js app correctly
  — if *that* one shows a red ❌, click into it now to see the specific
  error (see the next section for likely causes).

**The fix:** go to **Settings → Pages → Source** and switch it to **"GitHub
Actions"** right now if it isn't already. Then go to the **Actions** tab,
click into your own workflow's failed run, and click **"Re-run all jobs"**
(or push any small change to trigger a fresh run). Once your own workflow's
`build` and `deploy` jobs both succeed, the legacy "pages build and
deployment" pipeline will stop running on future pushes, and your real app
will be served instead.

### Otherwise, check these three things in order:

**1. Check you're opening the exact right address.**
GitHub Pages project sites are always served at:
```
https://<your-username>.github.io/<repo-name>/
```
— **with** the repository name in the path **and** a trailing slash. Opening
just `https://<your-username>.github.io/` (without the repo name) will
always 404 unless your repository is literally named
`<your-username>.github.io`. Also double check the capitalisation matches
your repo's name exactly (GitHub Pages URLs are case-sensitive) — e.g. a
repo named `Smart-Citizen2026` must be opened as `.../Smart-Citizen2026/`,
not `.../smart-citizen2026/`.

**2. Check the Pages source setting.**
Go to your repo → **Settings → Pages**. Under "Build and deployment", the
**Source** dropdown must be set to **"GitHub Actions"** — not "Deploy from a
branch" (which is GitHub's older default and won't use the workflow in this
project at all).

**3. Check the Actions tab for a failed run.**
Go to your repo → **Actions** tab. If the most recent "Deploy to GitHub
Pages" run shows a red ❌ instead of a green ✓, nothing was ever published —
which is exactly why the site shows 404 (there's no site deployed yet).
Click into the failed run to see which step failed:

- If **"Verify repository structure"** failed, your repository's files are
  nested inside an extra folder (the same issue described in the Vercel
  troubleshooting section below) — follow that fix, commit, and push again.
- If **"Build static export"** failed, open that step's log for the specific
  error and share it if you need further help.
- If everything in the `build` job passed but the `deploy` job failed or is
  missing, re-check that Pages' Source is set to "GitHub Actions" (step 2
  above) and re-run the workflow from the Actions tab (**Re-run all jobs**).
- If the run's **Summary** page (not a specific job) shows a red
  **"Invalid workflow file"** banner with a message like *"You have an error
  in your yaml syntax on line 31"* (or any line number), the workflow file
  itself is corrupted — this almost always happens from typing/pasting its
  contents into GitHub's web editor by hand, which can silently convert
  straight quote characters into "smart quotes" that break YAML parsing. Go
  back to **"Uploading via the GitHub website"** above and follow the
  **"upload the real file, don't retype it"** steps to fix this properly.

**4. Check there's a run at all — and that it's on the `main` branch.**
The workflow only triggers automatically on pushes to a branch literally
named `main`. If your repository's default branch is named `master` (an
older GitHub default) or something else, pushes/file creations there won't
trigger it. To check: go to the **Actions** tab — if you see **no runs at
all** (not even a failed one), open the workflow file
(`.github/workflows/deploy-pages.yml`) on GitHub and check your repository's
default branch name (shown next to the branch-switcher dropdown on your
repo's main page). If it's not `main`, either rename your default branch to
`main` (Settings → Branches), or edit the workflow's `branches: ["main"]`
line to match your actual branch name. Alternatively, you can always trigger
a run manually regardless of branch: go to **Actions → Deploy to GitHub
Pages → Run workflow** button (this uses the `workflow_dispatch` trigger
already included in the workflow).

## Technical note (why "unreachable page" happened before)

Earlier preview links (the ones starting with something like
`https://3000-xxxxx.e2b.app`) are **temporary development sandbox URLs** —
they only exist while an editing session is active and are torn down
afterwards, which is why they eventually stop working. GitHub Pages (set up
above) gives you a real, permanent, always-on URL instead, with no sandbox
dependency at all.

---

# Deploying to Vercel instead (alternative to GitHub Pages)

If you prefer Vercel over GitHub Pages, this project also deploys there —
`vercel.json`, `.nvmrc`, and `.node-version` are already included to avoid
known Next.js 16 + Vercel build-pipeline issues. Connect your GitHub repo to
Vercel as normal ("Add New... → Project → select your repo → Deploy").

## Troubleshooting Vercel build errors

### Error: "Couldn't find any 'pages' or 'app' directory"

This means Vercel cloned your repository but **`package.json` and `src/app`
are not sitting at the very top level of it**. This almost always happens
when a ZIP file is extracted and the *extracted folder itself* (not its
contents) gets copied into the GitHub repo — creating one extra nested
folder level, e.g.:

```
❌ WRONG (nested one level too deep):
your-repo/
  └── my-project/              <- extra folder!
        ├── package.json
        ├── next.config.ts
        ├── src/
        └── public/

✅ CORRECT (files directly at repo root):
your-repo/
  ├── package.json
  ├── next.config.ts
  ├── src/
  └── public/
```

**How to check:** open your repository on github.com in the browser. The
very first thing you see (without clicking into any folder) must already
include `package.json`, `next.config.ts`, `tsconfig.json`, a `src` folder,
and a `public` folder. If instead you see a single folder containing all of
those, that's the problem.

**How to fix it (pick one):**

- **Option A — fix the repo structure (recommended):** On your computer,
  move every file and folder *out of* that inner folder and up into the
  repository's root, delete the now-empty inner folder, then:
  ```bash
  git add -A
  git commit -m "Fix repo structure: move project files to repo root"
  git push
  ```
- **Option B — tell Vercel about the nested folder (no restructuring):** In
  your Vercel project → **Settings → General → Root Directory** → click
  **Edit** → enter the name of that inner folder (e.g. `my-project`) →
  **Save** → go to the **Deployments** tab → **Redeploy**.

After either fix, trigger a new deployment and the error will be gone.

### Error related to Turbopack / build pipeline failing right after "Installing dependencies..."

Already fixed by the included `vercel.json` (forces the stable Webpack
build) and `.nvmrc`/`.node-version` (pins a compatible Node.js version). If
you created your Vercel project *before* these files were added to the
repo, make sure you've pulled the latest commit and pushed it, then
redeploy.
