
import { useFilters } from "../context/FilterContext";

function FilterPanel() {
  const { filters, updateFilter, clearFilters } = useFilters();

  return (
    <aside className="filter-panel">

      <div className="filter-heading">
        <h3>Filters</h3>
        <button onClick={clearFilters}>Clear All</button>
      </div>

      <div className="filter-group">
        <label>Location</label>
        <select
          value={filters.location}
          onChange={(e) => updateFilter("location", e.target.value)}
        >
          <option value="All">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Noida">Noida</option>
          <option value="Pune">Pune</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Job Type</label>
        <select
          value={filters.jobType}
          onChange={(e) => updateFilter("jobType", e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Experience Level</label>
        <select
          value={filters.experience}
          onChange={(e) => updateFilter("experience", e.target.value)}
        >
          <option value="All">All Experience</option>
          <option value="Fresher">Fresher</option>
          <option value="Entry Level">Entry Level</option>
          <option value="Mid Level">Mid Level</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Salary Range (LPA)</label>
        <select
          value={filters.salaryRange}
          onChange={(e) => updateFilter("salaryRange", e.target.value)}
        >
          <option value="All">Any Salary</option>
          <option value="0-5">0 - 5 LPA</option>
          <option value="5-10">5 - 10 LPA</option>
          <option value="10-15">10 - 15 LPA</option>
          <option value="15+">15+ LPA</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Education Level</label>
        <select
          value={filters.education}
          onChange={(e) => updateFilter("education", e.target.value)}
        >
          <option value="All">All Education Levels</option>
          <option value="High School">High School</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor's Degree">Bachelor's Degree</option>
          <option value="Master's Degree">Master's Degree</option>
          <option value="PhD">PhD</option>
        </select>
      </div>

    </aside>
  );
}

export default FilterPanel;
