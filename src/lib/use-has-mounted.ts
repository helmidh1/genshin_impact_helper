"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns true once the component has mounted on the client in the browser.
 * Uses useSyncExternalStore with false as server snapshot and true as client snapshot,
 * perfectly avoiding React 19 set-state-in-effect warnings and SSR hydration mismatches.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
