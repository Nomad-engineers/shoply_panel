"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Centrifuge } from "centrifuge";

interface OrderWsEvent {
  orderId: number;
}

interface UseOrderSocketOptions {
  onOrderEvent?: (event: OrderWsEvent) => void;
  enabled?: boolean;
}

export function useOrderSocket(options: UseOrderSocketOptions = {}) {
  const { onOrderEvent, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  const callbackRef = useRef(onOrderEvent);
  callbackRef.current = onOrderEvent;

  useEffect(() => {
    if (!enabled) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const centrifugoUrl = process.env.NEXT_PUBLIC_CENTRIFUGO_URL || "ws://localhost:8000/connection/websocket";
    const token = localStorage.getItem("access_token");

    console.log("[ws] init", { apiUrl, centrifugoUrl, hasToken: !!token });

    if (!token) {
      console.warn("[ws] no access_token — abort connect");
      return;
    }

    const fetchToken = async () => {
      console.log("[ws] getToken →", `${apiUrl}/ws/token`);
      try {
        const res = await fetch(`${apiUrl}/ws/token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        const wsToken = json?.data?.token ?? json?.token;
        console.log("[ws] getToken ok", { hasToken: !!wsToken });
        if (!wsToken) throw new Error("empty token in response");
        return wsToken as string;
      } catch (e) {
        console.error("[ws] getToken FAIL", e);
        throw e;
      }
    };

    const centrifuge = new Centrifuge(centrifugoUrl, {
      getToken: fetchToken,
      debug: true,
    });

    // Subscribe to admin channel
    const sub = centrifuge.newSubscription("admin");

    sub.on("publication", (ctx) => {
      console.log("[ws] publication", { channel: ctx.channel, data: ctx.data });
      callbackRef.current?.(ctx.data as OrderWsEvent);
    });

    sub.on("subscribed", (ctx) => {
      console.log("[ws] subscribed", { channel: ctx.channel, recovered: ctx.recovered });
    });

    sub.on("subscribing", (ctx) => {
      console.log("[ws] subscribing", { channel: ctx.channel, code: ctx.code, reason: ctx.reason });
    });

    sub.on("error", (ctx) => {
      console.error("[ws] subscription error", { channel: ctx.channel, type: ctx.type, error: ctx.error });
    });

    console.log("[ws] connect →", centrifugoUrl);
    sub.subscribe();
    centrifuge.connect();

    centrifuge.on("connected", (ctx) => {
      console.log("[ws] connected", { client: ctx.client, transport: ctx.transport });
      setIsConnected(true);
    });

    centrifuge.on("disconnected", (ctx) => {
      console.warn("[ws] disconnected", { code: ctx.code, reason: ctx.reason });
      setIsConnected(false);
    });

    centrifuge.on("error", (ctx) => {
      console.error("[ws] transport error", { type: ctx.type, error: ctx.error });
    });

    centrifugeRef.current = centrifuge;

    return () => {
      console.log("[ws] cleanup — disconnect");
      sub.unsubscribe();
      centrifuge.disconnect();
      centrifugeRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  return { isConnected };
}
