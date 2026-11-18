import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useJobs from "../hooks/useJobs";
import JobMatchCard from "../components/JobMatchCard";
import { calculateJobMatch } from "../utils/jobMatcher";
import { fetchProfile } from "../services/profileService";

function Recommendations() {
  const { jobs, loading, error, retry } = useJobs();
  const [profile, setProfile] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Recommendations use the profile saved in the SQLite database.
  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((data) => { if (active) setProfile(data || {}); })
      .catch((err) => {
        if (active) setProfileError(err.response?.data?.message || "Unable to load your profile.");
      })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, []);

  const recommendations = useMemo(() => jobs
    .map((job) => ({ job, match: calculateJobMatch(job, profile) }))
    .sort((a, b) => b.match.score - a.match.score), [jobs, profile]);

  const strongMatches = recommendations.filter((item) => item.match.score >= 65).length;
  const profileIncomplete = !(profile.education && profile.skills?.trim() && profile.experience);

  return (
    <main className="recommendations-page">
      <section className="recommendations-header">
        <div>
          <h1>Recommended for You</h1>
          <p>Jobs ranked according to your education, skills, experience and preferred location.</p>
        </div>
        <div className="recommendation-stats">
          <div><strong>{jobs.length}</strong><span>Jobs analyzed</span></div>
          <div><strong>{strongMatches}</strong><span>Strong matches</span></div>
        </div>
      </section>

      {profileIncomplete && !profileLoading && (
        <div className="profile-completion-note">
          <div>
            <strong>Complete your profile for better recommendations</strong>
            <p>Add your education, skills and experience to calculate more meaningful job matches.</p>
          </div>
          <Link to="/profile">Complete Profile →</Link>
        </div>
      )}

      {profileError && <p className="data-message" role="alert">{profileError}</p>}

      <section className="recommendation-results">
        <div className="recommendation-section-heading">
          <div><h2>Jobs matched to your profile</h2><p>Highest matching opportunities appear first.</p></div>
          <span>{recommendations.length} recommendations</span>
        </div>

        {loading || profileLoading ? (
          <div className="data-message">Loading recommendations...</div>
        ) : error ? (
          <div className="data-message"><p>{error}</p><button onClick={retry}>Try Again</button></div>
        ) : recommendations.length > 0 ? (
          <div className="recommendation-list">
            {recommendations.map(({ job, match }) => (
              <JobMatchCard key={job.id} job={job} match={match} />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty"><h3>No jobs available</h3><p>Check back when more opportunities are added.</p></div>
        )}
      </section>
    </main>
  );
}

export default Recommendations;
