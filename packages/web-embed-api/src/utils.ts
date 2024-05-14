import { ArrayMap, ElementType } from '@formsort/constants';

export function addToArrayMap<T extends ArrayMap, K extends keyof T>(
  arrayMap: T,
  key: K,
  val: ElementType<T[K]>
) {
  arrayMap[key].push(val);
}

export function removeFromArrayMap<T extends ArrayMap, K extends keyof T>(
  arrayMap: T,
  key: K,
  val: ElementType<T[K]>
) {
  const indexOfElem = arrayMap[key].findIndex((elem) => elem === val);
  if (indexOfElem !== -1) {
    arrayMap[key].splice(indexOfElem, 1);
  }
}

export function isEmpty<T>(val: T[]): val is [] {
  return val.length === 0;
}

/**
 * in local development or legacy flow domains, we need to append the client label
 * to the path for historical reasons
 */
export function isLocalOrLegacyFlowOrigin(url: string) {
  if (!url.match(/^https?:\/\//)) {
    url = `http://${url}`;
  }

  let urlObj: URL;

  try {
    urlObj = new URL(url);
  } catch (e) {
    return false;
  }

  const hostname = urlObj.hostname;

  return hostname === 'localhost' || hostname === '127.0.0.1' || Boolean(hostname.match(/^flow(\.beta)?\.formsort\.com$/));
}