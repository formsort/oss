import { ArrayMap, ElementType } from './interfaces';

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
