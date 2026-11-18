
import { Link, useParams } from "react-router-dom";
import companies from "../data/companies";
import jobs from "../data/jobs";

function CompanyProfile() {
  const { slug } = useParams();

  const company = companies.find(
    (item) => item.slug === slug
  );

  if (!company) {
    return (
      <div className="company-not-found">
        <h2>Company Not Found</h2>
        <Link to="/companies">Back to Companies</Link>
      </div>
    );
  }

  const companyJobs = jobs.filter(
    (job) => job.company === company.name
  );

  return (
    <main className="company-profile-page">

      <Link to="/companies" className="company-back-link">
        ← Back to Companies
      </Link>

      <section className="company-profile-header">

        <div
          className="company-profile-logo"
          style={{ backgroundColor: company.color }}
        >
          {company.logo}
        </div>

        <div>
          <h1>{company.name}</h1>
          <p>{company.industry}</p>
          <span>📍 {company.location}</span>
        </div>

      </section>

      <section className="company-about">

        <h2>About Company</h2>

        <p>{company.description}</p>

        <p>{company.about}</p>

      </section>

      <section className="company-openings">

        <div className="company-openings-heading">
          <div>
            <h2>Current Job Openings</h2>
            <p>Explore available opportunities at {company.name}.</p>
          </div>

          <span>{companyJobs.length} jobs available</span>
        </div>

        {companyJobs.length > 0 ? (

          <div className="company-job-list">

            {companyJobs.map((job) => (

              <div className="company-job-card" key={job.id}>

                <div>
                  <h3>{job.title}</h3>

                  <p>{job.location}</p>

                  <div className="company-job-tags">
                    <span>{job.type}</span>
                    <span>{job.experience}</span>
                    <span>{job.salary}</span>
                  </div>
                </div>

                <Link
                  to={`/jobs/${job.id}`}
                  className="company-view-btn"
                >
                  View Job →
                </Link>

              </div>

            ))}

          </div>

        ) : (
          <p>No current openings available.</p>
        )}

      </section>

    </main>
  );
}

export default CompanyProfile;
