import { useEffect } from "react";

import { useAppStore } from "@/store/app-store";

export function useAppBootstrap() {
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);
}
