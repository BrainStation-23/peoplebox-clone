import { createContext, useContext, ReactNode } from 'react';

interface FeatureFlags {
  useNewProcessing: boolean;
}

const defaultFlags: FeatureFlags = {
  useNewProcessing: false
};

const FeatureFlagContext = createContext<FeatureFlags>(defaultFlags);

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}

interface FeatureFlagProviderProps {
  children: ReactNode;
  flags?: Partial<FeatureFlags>;
}

export function FeatureFlagProvider({ children, flags = {} }: FeatureFlagProviderProps) {
  const value = {
    ...defaultFlags,
    ...flags
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}