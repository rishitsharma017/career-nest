
import jobSkills from "../data/jobSkills";

// Education qualification levels
const educationRank = {
  "High School": 1,
  "Diploma": 2,
  "Bachelor's Degree": 3,
  "Master's Degree": 4,
  "PhD": 5
};

// Experience levels
const candidateExperienceRank = {
  "Fresher": 2,
  "Less than 1 year": 2,
  "1-3 years": 3,
  "3-5 years": 4,
  "5+ years": 5
};

const jobExperienceRank = {
  "Fresher": 1,
  "Entry Level": 2,
  "Mid Level": 3
};

// Convert specific degrees into qualification levels
function getEducationRank(education = "") {
  const value = education.toLowerCase();

  if (value.includes("phd")) return 5;

  if (
    value.includes("m.tech") ||
    value.includes("m.e.") ||
    value.includes("master") ||
    value === "mca" ||
    value === "m.sc." ||
    value === "mba"
  ) {
    return 4;
  }

  if (value.includes("diploma")) return 2;
  if (value.includes("high school")) return 1;

  if (
    value.includes("b.tech") ||
    value.includes("b.e.") ||
    value.includes("bachelor") ||
    value === "bca" ||
    value.includes("b.sc.")
  ) {
    return 3;
  }

  return educationRank[education] || 0;
}

// Normalize common skill abbreviations
const skillAliases = {
  "js": "javascript",
  "reactjs": "react",
  "react.js": "react",
  "nodejs": "node.js",
  "node": "node.js",
  "ml": "machine learning",
  "ai": "artificial intelligence",
  "cpp": "c++",
  "py": "python",
  "ui/ux": "ui ux"
};

function normalizeSkill(skill) {
  const normalized = String(skill)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return skillAliases[normalized] || normalized;
}

export function calculateJobMatch(job, profile = {}) {
  // Candidate skills
  const candidateSkills = (profile.skills || "")
    .split(/[,;\n]/)
    .map(normalizeSkill)
    .filter(Boolean);

  const candidateSkillSet = new Set(candidateSkills);

  // Skills required for this job
  const requiredSkills = jobSkills[job.id] || [];

  const matchedSkills = requiredSkills.filter((skill) =>
    candidateSkillSet.has(normalizeSkill(skill))
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !candidateSkillSet.has(normalizeSkill(skill))
  );

  // 1. Education score: 30 points
  const candidateEducation = getEducationRank(profile.education);
  const requiredEducation = getEducationRank(job.education);

  const educationMatch =
    candidateEducation > 0 &&
    requiredEducation > 0 &&
    candidateEducation >= requiredEducation;

  const educationScore = educationMatch ? 30 : 0;

  // 2. Skills score: 35 points
  const skillsScore = requiredSkills.length > 0
    ? Math.round(
        (matchedSkills.length / requiredSkills.length) * 35
      )
    : 0;

  // 3. Experience score: 20 points
  const candidateExperience =
    candidateExperienceRank[profile.experience] || 0;

  const requiredExperience =
    jobExperienceRank[job.experience] || 0;

  const experienceMatch =
    candidateExperience > 0 &&
    requiredExperience > 0 &&
    candidateExperience >= requiredExperience;

  const experienceScore = experienceMatch ? 20 : 0;

  // 4. Location score: 15 points
  const preferredLocation = profile.preferredLocation || "All";

  const locationMatch =
    preferredLocation === "All" ||
    job.location.toLowerCase().includes(
      preferredLocation.toLowerCase()
    );

  const locationScore = locationMatch ? 15 : 0;

  // Final match score
  const score = Math.min(
    100,
    educationScore +
    skillsScore +
    experienceScore +
    locationScore
  );

  // Match category
  let label = "Low Match";

  if (score >= 80) {
    label = "Excellent Match";
  } else if (score >= 65) {
    label = "Strong Match";
  } else if (score >= 40) {
    label = "Good Match";
  }

  // Explain each component
  const breakdown = [
    {
      label: "Education",
      score: educationScore,
      maximum: 30,
      detail: !profile.education
        ? "Add your education to assess qualification compatibility."
        : educationMatch
          ? "Your qualification meets the job's minimum education requirement."
          : `This job requires ${job.education}; your profile lists ${profile.education}.`
    },
    {
      label: "Skills",
      score: skillsScore,
      maximum: 35,
      detail: candidateSkills.length === 0
        ? "Add your skills to your profile to calculate skill compatibility."
        : `${matchedSkills.length} of ${requiredSkills.length} required skills matched.`
    },
    {
      label: "Experience",
      score: experienceScore,
      maximum: 20,
      detail: !profile.experience
        ? "Add your experience level to calculate compatibility."
        : experienceMatch
          ? "Your experience level meets the job requirement."
          : `This role requires ${job.experience}; your profile lists ${profile.experience}.`
    },
    {
      label: "Location",
      score: locationScore,
      maximum: 15,
      detail: preferredLocation === "All"
        ? "No location preference selected; no location penalty applied."
        : locationMatch
          ? `Matches your preferred location: ${preferredLocation}.`
          : `This job is in ${job.location}; your preferred location is ${preferredLocation}.`
    }
  ];

  return {
    score,
    label,
    breakdown,
    matchedSkills,
    missingSkills,
    requiredSkills
  };
}
