
import { Link } from "react-router-dom";

import JobCard from "../components/JobCard";
import useJobs from "../hooks/useJobs";
import useSavedJobs from "../hooks/useSavedJobs";

function SavedJobs() {
  const { jobs, loading, error, retry } = useJobs();

  const { savedJobs, isSaved, toggleSave } = useSavedJobs();

  const savedJobList = jobs.filter(
    (job) => savedJobs.includes(Number(job.id))
  );

  return (
    <main className="saved-page">

      <div className="saved-header">
        <div>
          <h1>Saved Jobs</h1>
          <p>Your bookmarked career opportunities.</p>
        </div>

        <span>{savedJobList.length} saved jobs</span>
      </div>

      {loading ? (
        <div className="data-message">
          Loading saved jobs...
        </div>
      ) : error ? (
        <div className="data-message">
          <p>{error}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      ) : savedJobList.length > 0 ? (

        <div className="saved-jobs-grid">

          {savedJobList.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={isSaved(job.id)}
              onSave={toggleSave}
            />
          ))}

        </div>

      ) : (

        <div className="empty-saved">
          <div className="empty-icon">☆</div>

          <h2>No saved jobs yet</h2>

          <p>
            You haven't bookmarked any jobs.
            Explore opportunities and save the ones you like.
          </p>

          <Link to="/" className="browse-btn">
            Explore Jobs
          </Link>
        </div>

      )}

    </main>
  );
}

export default SavedJobs;
