
import { useState } from "react";

import JobCard from "../components/JobCard";
import FilterPanel from "../components/FilterPanel";
import Pagination from "../components/Pagination";

import { useFilters } from "../context/FilterContext";
import useJobs from "../hooks/useJobs";
import usePagination from "../hooks/usePagination";
import useSavedJobs from "../hooks/useSavedJobs";

// Common abbreviations and their full meanings
const SEARCH_ALIASES = {
  sde: ["software development engineer", "software engineer"],
  swe: ["software engineer", "software development engineer"],
  frontend: ["front end developer", "front-end developer"],
  "front-end": ["frontend developer", "front end developer"],
  backend: ["back end developer", "back-end developer"],
  "back-end": ["backend developer", "back end developer"],
  ml: ["machine learning"],
  ai: ["artificial intelligence", "machine learning"],
  ds: ["data science", "data analyst", "data scientist"],
  qa: ["quality assurance"],
  devops: ["devops engineer", "dev ops"],
  ui: ["ui ux designer", "user interface"],
  ux: ["ui ux designer", "user experience"],
  se: ["software engineer", "software development engineer"],
  cyber: ["cybersecurity", "cyber security"]
};

// Suggestions displayed below the search bar
const KEYWORD_SUGGESTIONS = [
  { keyword: "SDE", label: "Software Development Engineer" },
  { keyword: "SWE", label: "Software Engineer" },
  { keyword: "ML", label: "Machine Learning" },
  { keyword: "AI", label: "Artificial Intelligence" },
  { keyword: "DS", label: "Data Science" },
  { keyword: "QA", label: "Quality Assurance" },
  { keyword: "DevOps", label: "DevOps Engineer" },
  { keyword: "UI/UX", label: "User Interface / User Experience" }
];

const educationRank = {
  "High School": 1,
  "Diploma": 2,
  "Bachelor's Degree": 3,
  "Master's Degree": 4,
  "PhD": 5
};

function Home() {
  const { filters, updateFilter } = useFilters();

  const { jobs, loading, error, retry } = useJobs();

  const { toggleSave, isSaved } = useSavedJobs();

  const [sortBy, setSortBy] = useState("newest");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Find keyword suggestions based on what the user types
  const searchQuery = (filters.search || "").trim().toLowerCase();

  const suggestions = KEYWORD_SUGGESTIONS.filter((item) => {
    return (
      item.keyword.toLowerCase().startsWith(searchQuery) ||
      item.label.toLowerCase().includes(searchQuery)
    );
  }).slice(0, 5);

  // Select a suggested keyword
  const selectSuggestion = (label) => {
    updateFilter("search", label);
    setShowSuggestions(false);
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const query = (filters.search || "").trim().toLowerCase();

    const searchableText = [
      job.title,
      job.company,
      job.location,
      job.description,
      job.type,
      job.experience
    ].join(" ").toLowerCase();

    // Expand abbreviations such as SDE into full job titles
    const queryTokens = query.split(/\s+/).filter(Boolean);

    const matchesSearch = queryTokens.every((token) => {
      const alternatives = [
        token,
        ...(SEARCH_ALIASES[token] || [])
      ];

      return alternatives.some((term) =>
        searchableText.includes(term)
      );
    });

    const matchesLocation =
      filters.location === "All" ||
      job.location.includes(filters.location);

    const matchesJobType =
      filters.jobType === "All" ||
      job.type === filters.jobType;

    const matchesExperience =
      filters.experience === "All" ||
      job.experience === filters.experience;

    // Education eligibility
    const jobEducationRank = educationRank[job.education];
    const selectedEducationRank = educationRank[filters.education];

    const matchesEducation =
      filters.education === "All" ||
      (
        jobEducationRank !== undefined &&
        selectedEducationRank !== undefined &&
        jobEducationRank <= selectedEducationRank
      );

    // Salary range overlap
    let matchesSalary = true;

    if (filters.salaryRange !== "All") {
      const salaryMin = Number(job.salaryMinLpa);
      const salaryMax = Number(job.salaryMaxLpa);

      let rangeMin = 0;
      let rangeMax = Infinity;

      switch (filters.salaryRange) {
        case "0-5":
          rangeMin = 0;
          rangeMax = 5;
          break;

        case "5-10":
          rangeMin = 5;
          rangeMax = 10;
          break;

        case "10-15":
          rangeMin = 10;
          rangeMax = 15;
          break;

        case "15+":
          rangeMin = 15;
          break;

        default:
          break;
      }

      matchesSalary =
        Number.isFinite(salaryMin) &&
        Number.isFinite(salaryMax) &&
        salaryMax > rangeMin &&
        salaryMin < rangeMax;
    }

    return (
      matchesSearch &&
      matchesLocation &&
      matchesJobType &&
      matchesExperience &&
      matchesEducation &&
      matchesSalary
    );
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          Number.parseInt(a.posted, 10) -
          Number.parseInt(b.posted, 10)
        );

      case "salary-high":
        return Number(b.salaryMaxLpa) - Number(a.salaryMaxLpa);

      case "salary-low":
        return Number(a.salaryMinLpa) - Number(b.salaryMinLpa);

      default:
        return 0;
    }
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage
  } = usePagination(
    sortedJobs,
    4,
    `${JSON.stringify(filters)}-${sortBy}`
  );

  return (
    <main className="home">

      <section className="hero">
        <h1>Find your next opportunity.</h1>

        <p>
          Discover jobs, explore companies and build your career.
        </p>

        {/* SMART SEARCH */}

        <div className="job-search-wrapper">

          <input
            type="text"
            placeholder="Search jobs, skills or keywords (e.g. SDE, ML, AI)..."
            value={filters.search}
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              updateFilter("search", e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              window.setTimeout(
                () => setShowSuggestions(false),
                150
              );
            }}
          />

          {showSuggestions && searchQuery.length > 0 &&
            suggestions.length > 0 && (

            <div className="search-suggestions">

              <div className="suggestion-heading">
                Suggested keywords
              </div>

              {suggestions.map((item) => (

                <button
                  type="button"
                  className="search-suggestion"
                  key={item.keyword}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(item.label)}
                >
                  <strong>{item.keyword}</strong>
                  <span>{item.label}</span>
                </button>

              ))}

            </div>
          )}

        </div>

        <small className="search-hint">
          Try: SDE · SWE · ML · AI · DS · QA
        </small>

      </section>

      <section className="jobs-section">

        <div className="section-heading">

          <div>
            <h2>Explore Opportunities</h2>
            <p>Find the right role for your next career move.</p>
          </div>

          <div className="results-tools">

            <span>
              {loading
                ? "Loading..."
                : `${filteredJobs.length} jobs found`}
            </span>

            <label className="sort-control">
              Sort by:

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="salary-high">Highest Salary</option>
                <option value="salary-low">Lowest Salary</option>
              </select>
            </label>

          </div>

        </div>

        <div className="jobs-layout">

          <FilterPanel />

          <div className="jobs-content">

            {loading ? (
              <div className="data-message">
                Loading jobs...
              </div>
            ) : error ? (
              <div className="data-message">
                <p>{error}</p>
                <button onClick={retry}>Try Again</button>
              </div>
            ) : (

              <>
                <div className="jobs-grid">

                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={isSaved(job.id)}
                        onSave={toggleSave}
                      />
                    ))
                  ) : (
                    <p className="no-jobs">
                      No matching jobs found. Try a different
                      keyword or change your filters.
                    </p>
                  )}

                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />

              </>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;
