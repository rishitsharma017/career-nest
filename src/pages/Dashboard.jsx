import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications } from "../services/applicationService";
import { fetchProfile } from "../services/profileService";
import useSavedJobs from "../hooks/useSavedJobs";

const STATUSES = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { savedJobs } = useSavedJobs();

  // Application history and profile now come from the Express/SQLite API.
  useEffect(() => {
    let active = true;
    Promise.all([fetchApplications(), fetchProfile()])
      .then(([applicationData, profileData]) => {
        if (!active) return;
        setApplications(Array.isArray(applicationData) ? applicationData : []);
        setProfile(profileData || {});
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Unable to load dashboard data. Check the backend server.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const total = applications.length;
  const countStatus = (status) => applications.filter((app) => app.status === status).length;
  const inProgress = applications.filter((app) => ["Applied", "Under Review", "Shortlisted", "Interview"].includes(app.status)).length;
  const interviews = countStatus("Interview");
  const selected = countStatus("Selected");
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);
  const maximumCount = Math.max(1, ...STATUSES.map(countStatus));

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? "Date unavailable" : parsedDate.toLocaleDateString("en-IN");
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <h1>Welcome back{profile.name ? `, ${profile.name}` : ""}!</h1>
          <p>Here's an overview of your job search activity.</p>
        </div>
        <Link to="/" className="dashboard-action">Explore Jobs →</Link>
      </section>

      {error && <p className="data-message" role="alert">{error}</p>}
      {loading ? <p className="data-message">Loading dashboard...</p> : (
        <>
          <section className="dashboard-stats">
            <div className="dashboard-stat-card"><span>Total Applications</span><h2>{total}</h2><small>All submitted applications</small></div>
            <div className="dashboard-stat-card"><span>In Progress</span><h2>{inProgress}</h2><small>Applications being processed</small></div>
            <div className="dashboard-stat-card"><span>Interviews</span><h2>{interviews}</h2><small>Interview opportunities</small></div>
            <div className="dashboard-stat-card"><span>Selected</span><h2>{selected}</h2><small>Successful applications</small></div>
          </section>

          <section className="dashboard-quick-links">
            <Link to="/saved" className="quick-link-card"><span className="quick-link-icon">★</span><div><h3>Saved Jobs</h3><p>{savedJobs.length} jobs bookmarked</p></div><span className="quick-arrow">→</span></Link>
            <Link to="/applications" className="quick-link-card"><span className="quick-link-icon">▤</span><div><h3>My Applications</h3><p>Manage application statuses</p></div><span className="quick-arrow">→</span></Link>
            <Link to="/profile" className="quick-link-card"><span className="quick-link-icon">●</span><div><h3>My Profile</h3><p>Update your career information</p></div><span className="quick-arrow">→</span></Link>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-heading"><div><h2>Application Overview</h2><p>Distribution of your application statuses.</p></div></div>
            {total > 0 ? (
              <div className="status-chart">
                {STATUSES.map((status) => {
                  const count = countStatus(status);
                  const percentage = (count / maximumCount) * 100;
                  return (
                    <div className="status-chart-row" key={status}>
                      <div className="status-chart-label"><span>{status}</span><strong>{count}</strong></div>
                      <div className="status-bar-background"><div className={`status-bar status-bar-${status.toLowerCase().replace(/\s+/g, "-")}`} style={{ width: `${percentage}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-empty"><h3>No application statistics yet</h3><p>Apply to jobs to see your application analytics here.</p><Link to="/" className="dashboard-action">Find Jobs</Link></div>
            )}
          </section>

          <section className="dashboard-panel recent-panel">
            <div className="dashboard-panel-heading"><div><h2>Recent Applications</h2><p>Your latest five job applications.</p></div><Link to="/applications">View All →</Link></div>
            {recentApplications.length > 0 ? (
              <div className="recent-applications">
                {recentApplications.map((application) => (
                  <div className="recent-application" key={application.id}>
                    <div><h3>{application.jobTitle}</h3><p>{application.company}</p><small>{formatDate(application.appliedAt)}</small></div>
                    <span className="recent-status">{application.status}</span>
                  </div>
                ))}
              </div>
            ) : <div className="dashboard-empty"><p>You haven't submitted any applications yet.</p></div>}
          </section>
        </>
      )}
    </main>
  );
}

export default Dashboard;
