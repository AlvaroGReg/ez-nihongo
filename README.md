# ez-nihongo

A localized Vue SPA for practising Japanese JLPT vocabulary. Choose English or
Spanish, select one or more JLPT levels and type the romanji reading for each
kanji and hiragana prompt.

Version `0.3.0` opens with quick JLPT vocabulary tests (levels and 10–100
questions), while offering an optional local study plan for users who want a
guided N5 path. It also includes kana, vocabulary and kanji study,
deterministic exercises, anonymous progress, streaks, favorites and notes. Its
requirements, design and traceability are documented in
[`specs/0.3.0/`](specs/0.3.0/). Authentication, payments and remote progress
remain outside this release.

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
