
import { Link } from "react-router-dom";

function JobCard({ job, isSaved, onSave }) {
  return (
    <div className="job-card">

      <div className="job-top">
        <div
          className="company-logo"
          style={{ backgroundColor: job.color }}
        >
          {job.logo}
        </div>

        <button
          className={`save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onSave(job.id)}
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          {isSaved ? "★" : "☆"}
        </button>
      </div>

      <h3>{job.title}</h3>

      <Link
        to={`/companies/${job.company.toLowerCase().replace(/\s+/g, "-")}`}
        className="company-name"
      >
        {job.company}
      </Link>

      <div className="job-info">
        <span>📍 {job.location}</span>
        <span>💼 {job.type}</span>
        <span>🎓 {job.experience}</span>
      </div>

      <div className="job-bottom">
        <div>
          <strong>{job.salary}</strong>
          <p>{job.posted}</p>
        </div>

        <Link to={`/jobs/${job.id}`} className="details-btn">
          View Details
        </Link>
      </div>

    </div>
  );
}

export default JobCard;
