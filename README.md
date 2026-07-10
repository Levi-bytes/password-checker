# Has This Password Leaked?

A client-side password strength and breach checker. No backend, no password
ever leaves the browser in full — only a 5-character hash prefix is sent,
using the same privacy technique real breach-checking services rely on.

**Live demo:** _add your link here once hosted_

## How it works

1. The password is hashed with SHA-1 entirely in the browser using the Web
   Crypto API.
2. Only the first 5 characters of that hash are sent to the
   [Have I Been Pwned](https://haveibeenpwned.com/API/v3#PwnedPasswords) API.
3. The API returns every breached hash suffix sharing that prefix — the
   actual match against the full hash happens locally, never on the server.
4. This technique is called **k-anonymity**: the server never receives
   enough information to know which password was checked.

Strength scoring (length, character variety, common-password detection) runs
entirely client-side too.

## Tech Stack

Vanilla HTML, CSS, JavaScript — no framework, no build step. Web Crypto API
for hashing, Have I Been Pwned Pwned Passwords API for breach data.

## Run it

Just open `index.html` in a browser, or serve the folder with any static
file server:

```bash
npx serve .
```

## Deploy

Drag-and-drop the folder into [Netlify](https://app.netlify.com/drop), or
connect the GitHub repo to Vercel/Netlify for automatic deploys — no build
configuration needed.

## License

MIT
