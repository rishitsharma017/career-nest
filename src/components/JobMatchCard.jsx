
import { Link } from "react-router-dom";

function JobMatchCard({ job, match }) {
  const matchClass = match.label
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <article className="job-match-card">

      <div className="match-card-top">

        <div className="match-job-heading">

          <div
            className="company-logo"
            style={{ backgroundColor: job.color }}
          >
            {job.logo}
          </div>

          <div>
            <h3>{job.title}</h3>

            <Link
              to={`/companies/${job.company.toLowerCase().replace(/\s+/g, "-")}`}
              className="match-company-link"
            >
              {job.company}
            </Link>

            <p className="match-job-meta">
              {job.location} · {job.type} · {job.experience}
            </p>
          </div>

        </div>

        <div className={`match-score ${matchClass}`}>
          <strong>{match.score}%</strong>
          <span>{match.label}</span>
        </div>

      </div>

      <div className="match-salary">
        {job.salary}
      </div>

      <div className="match-breakdown">

        <h4>Why this job matches your profile</h4>

        {match.breakdown.map((item) => (

          <div className="match-factor" key={item.label}>

            <div className="match-factor-heading">
              <strong>{item.label}</strong>
              <span>{item.score}/{item.maximum}</span>
            </div>

            <div className="match-progress-background">
              <div
                className="match-progress"
                style={{
                  width: `${(item.score / item.maximum) * 100}%`
                }}
              />
            </div>

            <p>{item.detail}</p>

          </div>

        ))}

      </div>

      <div className="match-skills">

        <div>
          <strong>Matched Skills</strong>

          <div className="skill-tags">
            {match.matchedSkills.length > 0 ? (
              match.matchedSkills.map((skill) => (
                <span className="matched-skill" key={skill}>
                  ✓ {skill}
                </span>
              ))
            ) : (
              <span className="no-skill">
                No matching skills identified
              </span>
            )}
          </div>
        </div>

        <div>
          <strong>Skills to Develop</strong>

          <div className="skill-tags">
            {match.missingSkills.length > 0 ? (
              match.missingSkills.map((skill) => (
                <span className="missing-skill" key={skill}>
                  + {skill}
                </span>
              ))
            ) : (
              <span className="matched-skill">
                All listed skills matched!
              </span>
            )}
          </div>
        </div>

      </div>

      <div className="match-card-footer">

        <span>
          {match.matchedSkills.length} of {match.requiredSkills.length} skills matched
        </span>

        <Link
          to={`/jobs/${job.id}`}
          className="match-view-button"
        >
          View Details →
        </Link>

      </div>

    </article>
  );
}

export default JobMatchCard;
