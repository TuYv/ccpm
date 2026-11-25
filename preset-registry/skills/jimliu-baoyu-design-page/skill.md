---
name: page
description: >-
  Make a free page: one complete HTML document you write yourself, kept as index.html in the artifact's folder
  with any files it needs beside it, opened as a live local page the person can use and comment on. The page can
  keep a small shared database, store files people add, hand the viewer a file to save, know who is viewing and
  talk to other open views, through the runtime capabilities you declare with the capabilities argument of
  Artifact publish. Use for a small interactive thing no other type fits: a widget or tool, a calculator, a mini
  game, an explainer page, a poll, checklist or sign-up sheet that remembers what people do on it. Not for a
  slide deck, a design to iterate on, a dashboard from data, a document, a spreadsheet or a film: those have types
  of their own.
---

# Page

A page artifact is a folder, `<root>`, whose `index.html` is the page: a whole HTML document, written by you. Files
next to it (`app.js`, `style.css`, `images/logo.svg`) are served beside it, by relative URL. Nothing else is needed:
no build step, no framework, no template. Open Artifact injects its runtime first in the page's `<head>`, so the page
finds `window.openArtifact` ready when its own scripts run (`window.claude` is the same object, for a page written for
claude.ai).

Say "your page" to the person (or the word they use: tool, game, widget), and refer to it by its title, never by ids
or folders.

## Make one

1. **Create it**, declaring what the page will use:

   ```json
   Artifact {"action": "publish", "type_url": "open-artifact://type/page", "title": "Team lunch poll",
             "capabilities": {"db": true}, "open": "after_first_write"}
   ```

   The result gives the folder (`root`). Until `index.html` exists, the page shows a quiet empty state.

2. **Write `index.html`** (and any files beside it) into `root`, with your own file tools, or with
   `Artifact {"action": "publish", "url": "<url>", "files": {"index.html": "<!doctype html>…"}}`. Open views reload
   when the file changes.

3. **Give it a `<title>`.** The page's title is the artifact's title, in the library and the page's top bar: a
   short, specific name ("Team lunch poll"), not a category and not a sentence.

4. **Look at it once, then hand it over.** When you can look at images, take a picture of the page as it draws:

   ```json
   Artifact {"action": "call", "url": "<url>", "name": "snapshot", "args": {"width": 400, "height": 900, "scheme": "dark"}}
   ```

   The answer's `image` is the path of a PNG. `width` (320 to 3840, default 1440), `height` (240 to 2160, default
   900) and `scheme` (`light`, the default, or `dark`) are all optional: one narrow picture and one in the other
   scheme catch most of what goes wrong (clipped text, a sideways scroll, a colour that vanishes). The snapshot only
   reads: a page that writes when it loads shows that write refused in the picture, and nothing is stored. A page
   that has not drawn within 8 seconds is pictured with its "did not start" card. It needs Chrome, Chromium or Edge
   on this computer (`unsupported` otherwise: then ask the person to look).

   A page that stores things: read back once what it wrote (`ArtifactData` `list`).
   `Artifact {"action": "call", "url": "<url>", "name": "info"}` lists the files the page has and what it declares.
   Fix what is visibly broken, in one pass, not a loop. Then tell the person in a line what you tried and what you
   could not.

## Design it

Nothing styles a page for you: what you leave undecided shows as a browser default. Before you write `index.html`,
read `artifact-type/reference/design.md`. The short form:

- The person's words first, then a design system or styles already in their project, then your own choices.
- Start from the subject, with its real content. Never placeholder text; examples are marked as examples.
- Put the design at the top of `<style>` as tokens on `:root` (colours, type, spacing), with a dark set under
  `@media (prefers-color-scheme: dark)`, and build every rule from them. Give `body` an explicit background.
- System font stacks, or font files beside the page. It works from about 360px wide and never scrolls sideways.
- Everything is visible when the page has loaded. A tool opens ready to work, with designed loading, empty and
  cannot-save states.
- Quiet by default: one bold idea at most, and only where the request calls for it.

Before a flow, an architecture or a comparison drawn in the page, read `artifact-type/reference/diagrams.md`.
Before a chart or a number tile, read `artifact-type/reference/charts.md`.

## Declare capabilities, then use them

Capabilities are never written in the page. You declare them with the `capabilities` argument of `Artifact`
`publish`, on create or on a later write (a write may carry `capabilities` alone, with no files):

| `capabilities` | Means |
| --- | --- |
| left out | Keep the current declaration. |
| `{}` | Declare none: the page keeps only `artifact` and `permissions`. |
| `{"db": true, "assets": true}` | This is the whole set from now on (it replaces the previous one). |

A value is `true` or an object of options. Open views reload with the new set. The declaration lives in the
artifact's record and its `.artifact.json`; a page cannot change it, not even by replacing its own `index.html`.

In the page, ask for each one with `use`, and handle `null` (not declared, or not available here):

```html
<script>
  (async () => {
    const db = await window.openArtifact.use('db');
    if (!db) return showOffline();
    const votes = db.collection('votes');
    votes.onSnapshot((snap) => render(snap.docs.map((d) => d.data())));
    document.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      votes.add({ choice: e.target.choice.value, at: Date.now() });
    };
  })();
</script>
```

What each capability does here, and what does not work on this computer, is in
`artifact-type/reference/capabilities.md`. Read it before you use one. In short:

- **Work here:** `db`, `artifact`, `assets`, `downloads`, `comments`, `user`, `room`, `permissions`, `network`.
- **Declared, but only answer with an error here:** `mcp` (`server_not_connected`), `sample` (`tools_unavailable`),
  `tts` and `paste` (`capability_disabled`). Write the page so it still works without them.
- **Anything else** is unknown here: `use()` gives `null`.

## Where things go

- `<root>/index.html`: the page. `<root>/<anything>`: files it loads by relative URL.
- `<root>/db/`: the page's database (`db`), one JSON file per document. Read and write it with `ArtifactData`, or
  from the page; do not edit it by hand while the page is open.
- `<root>/_blobs/`: files people upload through `assets`.
- `<root>/comments.json`: comment threads (`comments`); answer them with `ArtifactComments`.
- `.artifact.json`, names starting with `.` or `_`, `db/`, `history/` and `comments.json` belong to Open Artifact:
  never write them yourself.

## Rules for the page

- One self-contained document. Inline your CSS and scripts, or put them in files beside it. Scripts and fonts from a
  CDN may not load: the page runs on its own origin, and the person may be offline.
- The page can replace itself: `(await window.openArtifact.use('artifact')).publish(html)` writes a new `index.html`, as long
  as nobody changed the page since this view loaded it (otherwise it is refused with `conflict`). Every open view then
  reloads, this one too. `publish({"notes.txt": "…"})` writes other files and leaves the view running.
- `openArtifact` is a taken global name: a top-level `const`, `let`, `class` or `function openArtifact` in a classic script is a SyntaxError.
- Keep state that must last or be shared in `db`, not in `localStorage` (which stays in one browser, and can be
  empty or refuse). `localStorage` is for one reader's conveniences (a remembered tab, a draft): wrap it in
  `try`/`catch`, and let the page work without it.
- Pages on this computer are private to the person until they share them. A page can go to a site (Node or Cloudflare) the person
  publishes it to (`open-artifact publish`, the Share panel): there each viewer gets the level their role gives, and
  `db` rules decide who writes what. A site that does not run pages refuses it with `unsupported`: say so.
- Never make a page that impersonates a real person or organization, or one that collects passwords or payment
  details.
