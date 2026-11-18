
import { Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import SavedJobs from "./pages/SavedJobs";
import Applications from "./pages/Applications";
import Companies from "./pages/Companies";
import CompanyProfile from "./pages/CompanyProfile";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";

import { useFilters } from "./context/FilterContext";

import "./App.css";

function App() {
  const { clearFilters } = useFilters();

  return (
    <>
      <nav className="navbar">

        <Link
          to="/"
          className="brand"
          onClick={clearFilters}
        >
          CareerNest
        </Link>

        <div className="nav-links">
          <Link to="/">Find Jobs</Link>
          <Link to="/for-you">For You</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/companies">Companies</Link>
          <Link to="/saved">Saved Jobs</Link>
          <Link to="/applications">Applications</Link>
        </div>

        <Link to="/profile" className="profile-btn">
          My Profile
        </Link>

      </nav>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/for-you" element={<Recommendations />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route path="/saved" element={<SavedJobs />} />

        <Route path="/applications" element={<Applications />} />

        <Route path="/companies" element={<Companies />} />

        <Route
          path="/companies/:slug"
          element={<CompanyProfile />}
        />

        <Route path="/profile" element={<Profile />} />

        <Route
          path="*"
          element={<h2 className="not-found">Page Not Found</h2>}
        />

      </Routes>
    </>
  );
}

export default App;
