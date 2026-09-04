# ez-nihongo

An English SPA for practising Japanese JLPT vocabulary. Choose one or more JLPT
levels and a number of words, then type the romanji reading for each kanji and
hiragana prompt.

The first milestone is version `0.1.0`. Its requirements and implementation
decisions are documented in [`specs/0.1.0/`](specs/0.1.0/).

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
