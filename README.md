# Crawler CLI

A sample crawler CLI to find all images in the provided url and under all available links up to a configurable limit.

The results will be saved in `results.json` file 

## Installation

Install all required dependencies

```bash
npm install
```

## Build

In order to transform TS files to JS run

```bash
npm run build
```

## Usage

```bash
node dist/crawler.js <url: string> <depth: number>
````

### Example

```bash
node dist/crawler.js "https://developers.google.com/speed/webp/gallery" 1
```

### Dev

The recommended way to run CLI locally is to use `ts-node` to transform `*.ts` -> `*.js` on the fly

```bash
 npx ts-node src/crawler.ts "https://developers.google.com/speed/webp/gallery" 1
````

## License

[MIT](https://choosealicense.com/licenses/mit/)