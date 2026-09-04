# ez-nihongo

A localized Vue SPA for practising Japanese JLPT vocabulary. Choose English or
Spanish, select one or more JLPT levels and type the romanji reading for each
kanji and hiragana prompt.

Version `0.2.0` adds the localization, versioned session storage, content and
exercise contracts, provider adapter, attempt events, and local plan hints. Its
requirements and implementation decisions are documented in
[`specs/0.2.0/`](specs/0.2.0/). Authentication, payments and remote progress are
outside this release.

## Development

Install dependencies and start the local development server:

```sh
npm i
npm run dev
```

Useful checks:

```sh
npm run type-check
npm run test:unit -- --run
npm run build
```

The application uses the [JLPT Vocabulary API](https://jlpt-vocab-api.vercel.app/)
and is configured for deployment to GitHub Pages at `/ez-nihongo/`. The
deployment workflow is defined in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
