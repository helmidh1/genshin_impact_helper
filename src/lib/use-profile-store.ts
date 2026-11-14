"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  profileStore,
  SERVER_SNAPSHOT,
  type ProfileStore,
} from "@/lib/profile-store";
import type { ProfileState } from "@/types/genshin";

let activeInterval: NodeJS.Timeout | null = null;
let activeIntervalSubscribers = 0;

function setupLiveResinTick(store: ProfileStore): () => void {
  activeIntervalSubscribers++;
  if (!activeInterval && typeof window !== "undefined") {
    activeInterval = setInterval(() => {
      store.reconcileResin();
    }, 60 * 1000);
  }
  return () => {
    activeIntervalSubscribers--;
    if (activeIntervalSubscribers <= 0 && activeInterval) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
  };
}

export function useProfileStore(): ProfileState {
  useEffect(() => {
    return setupLiveResinTick(profileStore);
  }, []);

  return useSyncExternalStore(
    (listener) => profileStore.subscribe(listener),
    () => profileStore.getState(),
    () => SERVER_SNAPSHOT
  );
}
