
import { useState } from "react";
import { Link } from "react-router-dom";
import companies from "../data/companies";
import jobs from "../data/jobs";

function Companies() {
  const [search, setSearch] = useState("");

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="companies-page">

      <section className="companies-header">
        <h1>Explore Companies</h1>
        <p>
          Discover organizations and find your next career opportunity.
        </p>

        <input
          type="text"
          placeholder="Search companies or industries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <div className="companies-heading">
        <h2>Featured Companies</h2>
        <span>{filteredCompanies.length} companies found</span>
      </div>

      <section className="companies-grid">

        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => {

            const openings = jobs.filter(
              (job) => job.company === company.name
            );

            return (
              <div className="company-card" key={company.id}>

                <div
                  className="company-card-logo"
                  style={{ backgroundColor: company.color }}
                >
                  {company.logo}
                </div>

                <h3>{company.name}</h3>

                <p>{company.industry}</p>

                <span className="company-location">
                  📍 {company.location}
                </span>

                <span className="opening-count">
                  {openings.length} Open Job(s)
                </span>

                <Link
                  to={`/companies/${company.slug}`}
                  className="company-view-btn"
                >
                  View Company →
                </Link>

              </div>
            );
          })
        ) : (
          <p>No companies found.</p>
        )}

      </section>

    </main>
  );
}

export default Companies;
