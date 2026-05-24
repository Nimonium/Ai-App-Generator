"use client";

import { useEffect, useRef } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { AppConfig } from "@/lib/schema/app-config";

interface StoreProviderProps {
  appId: string;
  config: AppConfig;
  children: React.ReactNode;
}

export function BuilderStoreProvider({ appId, config, children }: StoreProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useBuilderStore.getState().initialize(appId, config);
      initialized.current = true;
    }
  }, [appId, config]);

  // Prevent children from rendering until the store has the config
  const storeAppId = useBuilderStore((state) => state.appId);
  if (storeAppId !== appId) return null;

  return <>{children}</>;
}
