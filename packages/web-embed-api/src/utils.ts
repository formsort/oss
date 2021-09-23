import { ArrayMap, ElementType } from './interfaces';

export function addToArrayMap<T extends ArrayMap, K extends keyof T>(
  arrayMap: T,
  key: K,
  val: ElementType<T[K]>
) {
  arrayMap[key].push(val);
}

export function isEmpty<T>(val: T[]): val is [] {
  return val.length === 0;
}
