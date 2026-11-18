
import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

const initialFilters = {
  search: "",
  location: "All",
  jobType: "All",
  experience: "All",
  salaryRange: "All",
  education: "All"
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (name, value) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <FilterContext.Provider
      value={{ filters, updateFilter, clearFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
