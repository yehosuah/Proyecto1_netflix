import { createContext, useContext } from "react";

const AppModelContext = createContext(null);

export function AppModelProvider({ value, children }) {
  return (
    <AppModelContext.Provider value={value}>{children}</AppModelContext.Provider>
  );
}

export function useAppModel() {
  const context = useContext(AppModelContext);

  if (!context) {
    throw new Error("useAppModel debe usarse dentro de AppModelProvider.");
  }

  return context;
}
