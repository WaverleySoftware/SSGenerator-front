import { Injectable } from '@angular/core';

/**
 * Request deduplication helper
 */
@Injectable()
export class RequestDeduplicationService {
  private cache = new Map<string, any>();
  private cacheTime = new Map<string, number>();
  private expire = 10000;

  constructor() {}

  execute(method, params) {
    const key = JSON.stringify(params);
    const now =  Date.now();

    if (
      this.cache.has(key) &&
      this.cacheTime.has(key) &&
      this.cacheTime.get(key) + this.expire > now
    ) {
      return this.cache.get(key);
    }

    const value = method(params);
    this.cache.set(key, value);
    this.cacheTime.set(key, now);

    return value;
  }
}

