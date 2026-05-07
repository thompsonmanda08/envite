/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  type PrecacheEntry,
  type SerwistGlobalConfig,
  Serwist,
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
  NetworkOnly,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
  runtimeCaching: [
    // ImageKit + remote images — CacheFirst, 7d
    {
      matcher: /^https:\/\/(?:ik\.imagekit\.io|imagekit\.io)\/.*/i,
      handler: new CacheFirst({
        cacheName: "imagekit-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 80,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Public invitation pages — StaleWhileRevalidate
    {
      matcher: ({ url, request }) =>
        request.destination === "document" && url.pathname.startsWith("/i/"),
      handler: new StaleWhileRevalidate({
        cacheName: "invite-pages",
      }),
    },
    // API GET reads — NetworkFirst with timeout, 10min cache
    {
      matcher: ({ url, request }) =>
        request.method === "GET" &&
        url.pathname.startsWith("/api/v1/") &&
        (url.pathname.includes("/list") ||
          url.pathname.endsWith("/details") ||
          url.pathname.includes("/event-type/")),
      handler: new NetworkFirst({
        cacheName: "api-reads",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 10 * 60,
          }),
        ],
      }),
    },
    // API mutations + dashboard navigations — NetworkOnly (no offline cache)
    {
      matcher: ({ url, request }) =>
        url.pathname.startsWith("/api/v1/") && request.method !== "GET",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url, request }) =>
        request.destination === "document" &&
        url.pathname.startsWith("/dashboard"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
