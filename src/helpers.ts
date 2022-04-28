import fetch from "node-fetch";
import fs from "fs";
import { URL } from "url";

/**
 * Converting relative paths to absolute
 */
export const prepareUrl = (href: string, baseUrl: string) => {
  return new URL(href, baseUrl);
};

export const getHtmlFromUrl = async (url: string) => {
  const response = await fetch(url);
  return response.text();
};

// writing results to filesystem
export const writeContentToFile = (content: string, filePath: string) => {
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};
