export interface ResultItem {
  imageUrl: string;
  sourceUrl: string; // the page url this image was found on
  depth: number; // the depth of the source at which this image was found on
}