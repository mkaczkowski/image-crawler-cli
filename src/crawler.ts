/**
 * CRAWLER CLI v.1.0.0
 * Usage
 * > node dist/crawler.js <url: string> <depth: number>
 * Example:
 * > node dist/crawler.js "https://developers.google.com/speed/webp/gallery" 1
 */

import cheerio from "cheerio";
import { getHtmlFromUrl, prepareUrl, writeContentToFile } from "./helpers.js";
import { ResultItem } from "./types.js";
import logger from "./logger.js";

const OUTPUT_FILENAME = "results.json";

// handling CLI arguments (could be done with 3rd party lib like commander)
function prepareCrawlerInputs() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    logger.error(
      "Expected exactly two arguments: <url: string> <depth: number>"
    );
    process.exit(1);
  }
  const [url, depth] = args;

  return {
    initialUrl: url,
    initialDepth: parseInt(depth),
  };
}

async function runCrawler() {
  logger.debug("Running crawler");

  const visitedUrls = new Set<string>();
  const results: ResultItem[] = [];

  // preparing initial inputs
  const { initialUrl, initialDepth } = prepareCrawlerInputs();

  // function be run in recursion
  const getImagesFromUrl = async (sourceUrl: string, depth: number) => {
    logger.debug(`fetching images for ${sourceUrl} with depth=${depth}`);

    // validate both depth and if url was already visited
    if (depth < 0 || visitedUrls.has(sourceUrl)) {
      logger.debug(`url already visited: ${sourceUrl}`);
      return;
    }

    visitedUrls.add(sourceUrl);

    // get html text from sourceUrl
    try {
      const body = await getHtmlFromUrl(sourceUrl);

      // parse the html text and extract titles
      const $ = cheerio.load(body);

      // store unique img to avoid duplications
      const imageSet = new Set<string>();

      // get img src using CSS selector
      $("img").each((index, element) => {
        const imgHref = $(element).attr("src");
        if (imgHref) {
          const { href: imageUrl } = prepareUrl(imgHref, initialUrl);

          // NOTE: we are accepting all formats like i.e. base64 "data:image/png;base64"
          imageSet.add(imageUrl);
          results.push({
            imageUrl,
            sourceUrl,
            depth: initialDepth - depth,
          });
        }
      });

      // preparing list of promises in order to check links in parallel
      const promiseList: Promise<unknown>[] = [];
      $("a").each((index, element) => {
        const linkHref = $(element).attr("href");
        if (linkHref) {
          const { href: nextUrl } = prepareUrl(linkHref, initialUrl);
          promiseList.push(getImagesFromUrl(nextUrl, depth - 1));
        }
      });

      // waiting for all promises to fullfil
      return Promise.allSettled(promiseList);
    } catch (err) {
      logger.error(
        `Something went wrong while parsing the url: ${sourceUrl}`,
        err
      );
    }
  };

  await getImagesFromUrl(initialUrl, initialDepth);

  const fileContent = JSON.stringify({ results }, null, 2);
  logger.debug(fileContent);
  writeContentToFile(fileContent, OUTPUT_FILENAME);
}

void runCrawler();
