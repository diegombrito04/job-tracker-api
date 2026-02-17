import { createContext, useContext, useState, type ReactNode } from "react";

type SearchContextType = {
  query: string;
  setQuery: (q: string) => void;
};

const SearchContext = createContext<SearchContextType>({
  query: "",
  setQuery: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}
