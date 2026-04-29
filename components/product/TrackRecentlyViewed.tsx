"use client";

import { useEffect } from "react";

type TrackRecentlyViewedProps = {
  productId: string;
};

export function TrackRecentlyViewed({ productId }: TrackRecentlyViewedProps) {
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/recently-viewed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => undefined);

    return () => controller.abort();
  }, [productId]);

  return null;
}
