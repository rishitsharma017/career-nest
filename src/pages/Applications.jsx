import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications, updateApplicationStatus } from "../services/applicationService";

const STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected"
];

function Applications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Load application records from SQLite through Express.
  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      try {
        const data = await fetchApplications();
        if (active) setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Unable to load applications. Check that the backend is running.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadApplications();
    return () => { active = false; };
  }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setError("");
    try {
      const result = await updateApplicationStatus(id, newStatus);
      setApplications((previous) => previous.map((application) =>
        application.id === id ? result.application : application
      ));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update the application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalApplications = applications.length;
  const inProgress = applications.filter((app) =>
    ["Applied", "Under Review", "Shortlisted", "Interview"].includes(app.status)
  ).length;
  const interviews = applications.filter((app) => app.status === "Interview").length;
  const selected = applications.filter((app) => app.status === "Selected").length;

  const filteredApplications = useMemo(() => applications
    .filter((app) => statusFilter === "All" || app.status === statusFilter)
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()),
  [applications, statusFilter]);

  return (
    <main className="applications-page">
      <div className="applications-header">
        <div>
          <h1>My Applications</h1>
          <p>Track your job applications and their progress.</p>
        </div>
      </div>

      <section className="application-stats">
        <div className="stat-card"><span>Total Applications</span><h2>{totalApplications}</h2></div>
        <div className="stat-card"><span>In Progress</span><h2>{inProgress}</h2></div>
        <div className="stat-card"><span>Interviews</span><h2>{interviews}</h2></div>
        <div className="stat-card"><span>Selected</span><h2>{selected}</h2></div>
      </section>

      <section className="application-section">
        <div className="application-list-header">
          <div>
            <h2>Application History</h2>
            <p>Manage and update your application statuses.</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Applications</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        {error && <p className="data-message" role="alert">{error}</p>}
        {loading ? (
          <div className="data-message">Loading applications...</div>
        ) : filteredApplications.length > 0 ? (
          <div className="application-list">
            {filteredApplications.map((application) => (
              <div className="application-card" key={application.id}>
                <div className="application-info">
                  <div className="application-company-logo">{application.company?.charAt(0) || "C"}</div>
                  <div>
                    <h3>{application.jobTitle}</h3>
                    <p>{application.company}</p>
                    <span>📍 {application.location}</span>
                    <span>💰 {application.salary}</span>
                    <small>Applied on: {new Date(application.appliedAt).toLocaleDateString("en-IN")}</small>
                  </div>
                </div>
                <div className="application-status">
                  <span className={`status-badge status-${application.status.toLowerCase().replace(/\s+/g, "-")}`}>{application.status}</span>
                  <label>Update Status</label>
                  <select
                    value={application.status}
                    disabled={updatingId === application.id}
                    onChange={(e) => updateStatus(application.id, e.target.value)}
                  >
                    {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <Link to={`/jobs/${application.jobId}`} className="application-view-link">View Job →</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-applications">
            <div className="empty-application-icon">📋</div>
            <h2>{applications.length === 0 ? "No applications yet" : "No matching applications"}</h2>
            <p>{applications.length === 0 ? "Apply to jobs and track your progress here." : "Try selecting another application status."}</p>
            <Link to="/" className="browse-btn">Explore Jobs</Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default Applications;
