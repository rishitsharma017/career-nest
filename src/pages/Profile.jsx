import { useEffect, useState } from "react";
import { fetchProfile, updateProfile } from "../services/profileService";

const defaultProfile = {
  name: "",
  email: "",
  phone: "",
  education: "",
  skills: "",
  experience: "",
  preferredLocation: "All",
  about: "",
  resumeFileName: ""
};

function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load the profile stored in SQLite when this page opens.
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        if (active) setProfile({ ...defaultProfile, ...data });
      } catch (error) {
        if (active) {
          setMessage(
            error.response?.data?.message ||
            "Unable to load your profile. Check that the backend is running."
          );
          setMessageType("error");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadProfile();
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    setProfile((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
    setMessage("");
    setMessageType("");
  };

  // Send the changed form values to the Express API.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const result = await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        education: profile.education,
        skills: profile.skills,
        experience: profile.experience,
        preferredLocation: profile.preferredLocation,
        about: profile.about,
        resumeFileName: profile.resumeFileName || ""
      });

      setProfile({ ...defaultProfile, ...result.profile });
      setMessage("Profile saved successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to save your profile. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="profile-page">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and career details.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-avatar">
          {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
        </div>

        <h2>Personal Information</h2>

        <div className="profile-form-grid">
          <div className="profile-field">
            <label>Full Name</label>
            <input type="text" name="name" value={profile.name} onChange={handleChange} placeholder="Enter your full name" required />
          </div>

          <div className="profile-field">
            <label>Email Address</label>
            <input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="Enter your email" required />
          </div>

          <div className="profile-field">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="Enter your phone number" />
          </div>

          <div className="profile-field">
            <label>Education / Qualification</label>
            <select name="education" value={profile.education} onChange={handleChange}>
              <option value="">Select Education</option>
              <optgroup label="Diploma">
                <option value="Diploma">Diploma</option>
              </optgroup>
              <optgroup label="Bachelor's Degree">
                <option value="B.Tech - Computer Science">B.Tech - Computer Science</option>
                <option value="B.Tech - Artificial Intelligence">B.Tech - Artificial Intelligence</option>
                <option value="B.Tech - Information Technology">B.Tech - Information Technology</option>
                <option value="B.Tech - Data Science">B.Tech - Data Science</option>
                <option value="B.Tech - Electronics">B.Tech - Electronics</option>
                <option value="B.E. - Computer Science">B.E. - Computer Science</option>
                <option value="BCA">BCA</option>
                <option value="B.Sc. - Computer Science">B.Sc. - Computer Science</option>
                <option value="B.Sc. - Data Science">B.Sc. - Data Science</option>
              </optgroup>
              <optgroup label="Master's Degree">
                <option value="M.Tech - Computer Science">M.Tech - Computer Science</option>
                <option value="M.Tech - Artificial Intelligence">M.Tech - Artificial Intelligence</option>
                <option value="M.Tech - Data Science">M.Tech - Data Science</option>
                <option value="M.E.">M.E.</option>
                <option value="MCA">MCA</option>
                <option value="M.Sc.">M.Sc.</option>
                <option value="MBA">MBA</option>
              </optgroup>
              <optgroup label="Doctorate">
                <option value="PhD">PhD</option>
              </optgroup>
              <option value="High School">High School</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="profile-field">
            <label>Skills</label>
            <input type="text" name="skills" value={profile.skills} onChange={handleChange} placeholder="React, JavaScript, Python..." />
            <small>Separate your skills using commas.</small>
          </div>

          <div className="profile-field">
            <label>Experience</label>
            <select name="experience" value={profile.experience} onChange={handleChange}>
              <option value="">Select Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>

          <div className="profile-field">
            <label>Preferred Job Location</label>
            <select name="preferredLocation" value={profile.preferredLocation} onChange={handleChange}>
              <option value="All">Any Location</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Noida">Noida</option>
              <option value="Pune">Pune</option>
            </select>
          </div>
        </div>

        <div className="profile-field about-field">
          <label>About Me</label>
          <textarea name="about" value={profile.about} onChange={handleChange} placeholder="Write a short introduction about yourself..." rows="5" />
        </div>

        <div className="profile-actions">
          <button type="submit" className="save-profile-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
          {message && (
            <span className={messageType === "success" ? "profile-success" : "profile-error"} role="status">
              {message}
            </span>
          )}
        </div>
      </form>
    </main>
  );
}

export default Profile;
