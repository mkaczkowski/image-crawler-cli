/**
 * CRAWLER CLI v.1.0.0
 * Usage
 * > node dist/crawler.js <url: string> <depth: number>
 * Example:
 * > node dist/crawler.js "https://developers.google.com/speed/webp/gallery" 1
 */
import cheerio from "cheerio";
import { getHtmlFromUrl, prepareUrl, writeContentToFile } from "./helpers.js";
import logger from "./logger.js";
const OUTPUT_FILENAME = "results.json";
// handling CLI arguments (could be done with 3rd party lib like commander)
function prepareCrawlerInputs() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        logger.error("Expected exactly two arguments: <url: string> <depth: number>");
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
    const visitedUrls = new Set();
    const results = [];
    // preparing initial inputs
    const { initialUrl, initialDepth } = prepareCrawlerInputs();
    // function be run in recursion
    const getImagesFromUrl = async (sourceUrl, depth) => {
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
            const imageSet = new Set();
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
            const promiseList = [];
            $("a").each((index, element) => {
                const linkHref = $(element).attr("href");
                if (linkHref) {
                    const { href: nextUrl } = prepareUrl(linkHref, initialUrl);
                    promiseList.push(getImagesFromUrl(nextUrl, depth - 1));
                }
            });
            // waiting for all promises to fullfil
            return Promise.allSettled(promiseList);
        }
        catch (err) {
            logger.error(`Something went wrong while parsing the url: ${sourceUrl}`, err);
        }
    };
    await getImagesFromUrl(initialUrl, initialDepth);
    const fileContent = JSON.stringify({ results }, null, 2);
    logger.debug(fileContent);
    writeContentToFile(fileContent, OUTPUT_FILENAME);
}
void runCrawler();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jhd2xlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jcmF3bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUU5RSxPQUFPLE1BQU0sTUFBTSxhQUFhLENBQUM7QUFFakMsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBRXZDLDJFQUEyRTtBQUMzRSxTQUFTLG9CQUFvQjtJQUMzQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQ1YsK0RBQStELENBQ2hFLENBQUM7UUFDRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBQ0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7SUFFMUIsT0FBTztRQUNMLFVBQVUsRUFBRSxHQUFHO1FBQ2YsWUFBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUM7S0FDOUIsQ0FBQztBQUNKLENBQUM7QUFFRCxLQUFLLFVBQVUsVUFBVTtJQUN2QixNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUN0QyxNQUFNLE9BQU8sR0FBaUIsRUFBRSxDQUFDO0lBRWpDLDJCQUEyQjtJQUMzQixNQUFNLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxHQUFHLG9CQUFvQixFQUFFLENBQUM7SUFFNUQsK0JBQStCO0lBQy9CLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVB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