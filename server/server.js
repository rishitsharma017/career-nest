

import express from "express";

import cors from "cors";

import initSqlJs from "sql.js";



import fs from "node:fs";

import path from "node:path";

import { fileURLToPath } from "node:url";

import { createRequire } from "node:module";



const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);



const app = express();

const PORT = 5000;



app.use(cors());

app.use(express.json({ limit: "1mb" }));



// ======================================

// 1. INITIALIZE SQLITE DATABASE

// ======================================



const databaseDirectory = path.join(__dirname, "database");



const databasePath = path.join(

  databaseDirectory,

  "careernest.sqlite"

);



const seedPath = path.join(__dirname, "../db.json");



fs.mkdirSync(databaseDirectory, { recursive: true });



const wasmPath = path.join(

  path.dirname(require.resolve("sql.js")),

  "sql-wasm.wasm"

);



const SQL = await initSqlJs({

  locateFile: () => wasmPath

});



const database = fs.existsSync(databasePath)

  ? new SQL.Database(fs.readFileSync(databasePath))

  : new SQL.Database();



database.run("PRAGMA foreign_keys = ON");



// Save changes permanently to the SQLite file

function saveDatabase() {

  const data = database.export();

  fs.writeFileSync(databasePath, Buffer.from(data));

}



// ======================================

// 2. CREATE DATABASE TABLES

// ======================================



database.exec(`

  CREATE TABLE IF NOT EXISTS jobs (

    id INTEGER PRIMARY KEY,

    title TEXT NOT NULL,

    company TEXT NOT NULL,

    location TEXT NOT NULL,

    type TEXT NOT NULL,

    experience TEXT NOT NULL,

    education TEXT NOT NULL,

    salary TEXT NOT NULL,

    salaryMinLpa REAL NOT NULL,

    salaryMaxLpa REAL NOT NULL,

    logo TEXT NOT NULL,

    color TEXT NOT NULL,

    posted TEXT NOT NULL,

    description TEXT NOT NULL

  );



  CREATE TABLE IF NOT EXISTS profiles (

    id INTEGER PRIMARY KEY CHECK(id = 1),

    name TEXT NOT NULL DEFAULT '',

    email TEXT NOT NULL DEFAULT '',

    phone TEXT NOT NULL DEFAULT '',

    education TEXT NOT NULL DEFAULT '',

    skills TEXT NOT NULL DEFAULT '',

    experience TEXT NOT NULL DEFAULT '',

    preferredLocation TEXT NOT NULL DEFAULT 'All',

    about TEXT NOT NULL DEFAULT '',

    resumeFileName TEXT NOT NULL DEFAULT '',

    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

  );



  CREATE TABLE IF NOT EXISTS saved_jobs (

    profileId INTEGER NOT NULL DEFAULT 1,

    jobId INTEGER NOT NULL,

    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (profileId, jobId),



    FOREIGN KEY (profileId) REFERENCES profiles(id)

      ON DELETE CASCADE,



    FOREIGN KEY (jobId) REFERENCES jobs(id)

      ON DELETE CASCADE

  );



  CREATE TABLE IF NOT EXISTS applications (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    profileId INTEGER NOT NULL DEFAULT 1,

    jobId INTEGER NOT NULL,

    jobTitle TEXT NOT NULL,

    company TEXT NOT NULL,

    location TEXT NOT NULL,

    salary TEXT NOT NULL,



    status TEXT NOT NULL DEFAULT 'Applied'

      CHECK(status IN (

        'Applied',

        'Under Review',

        'Shortlisted',

        'Interview',

        'Selected',

        'Rejected'

      )),



    appliedAt TEXT NOT NULL,



    applicantName TEXT NOT NULL DEFAULT '',

    applicantEmail TEXT NOT NULL DEFAULT '',

    applicantPhone TEXT NOT NULL DEFAULT '',

    applicantEducation TEXT NOT NULL DEFAULT '',

    applicantSkills TEXT NOT NULL DEFAULT '',

    applicantExperience TEXT NOT NULL DEFAULT '',



    UNIQUE(profileId, jobId),



    FOREIGN KEY (profileId) REFERENCES profiles(id)

      ON DELETE CASCADE,



    FOREIGN KEY (jobId) REFERENCES jobs(id)

      ON DELETE CASCADE

  );



  CREATE INDEX IF NOT EXISTS idx_applications_status

  ON applications(status);



  CREATE INDEX IF NOT EXISTS idx_applications_profile

  ON applications(profileId);

`);



// ======================================

// 3. DATABASE HELPER FUNCTIONS

// ======================================



function getAll(sql, parameters = []) {

  const statement = database.prepare(sql);



  try {

    if (parameters.length) {

      statement.bind(parameters);

    }



    const rows = [];



    while (statement.step()) {

      rows.push(statement.getAsObject());

    }



    return rows;

  } finally {

    statement.free();

  }

}



function getOne(sql, parameters = []) {

  return getAll(sql, parameters)[0] || null;

}



function execute(sql, parameters = []) {

  database.run(sql, parameters);

  saveDatabase();



  return database.getRowsModified();

}



// ======================================

// 4. IMPORT INITIAL JOB DATA

// ======================================



function seedJobs() {

  if (!fs.existsSync(seedPath)) {

    throw new Error("db.json seed file was not found.");

  }



  const seedData = JSON.parse(

    fs.readFileSync(seedPath, "utf8")

  );



  if (!Array.isArray(seedData.jobs)) {

    throw new Error("db.json must contain a jobs array.");

  }



  const statement = database.prepare(`

    INSERT INTO jobs (

      id,

      title,

      company,

      location,

      type,

      experience,

      education,

      salary,

      salaryMinLpa,

      salaryMaxLpa,

      logo,

      color,

      posted,

      description

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)



    ON CONFLICT(id) DO UPDATE SET

      title = excluded.title,

      company = excluded.company,

      location = excluded.location,

      type = excluded.type,

      experience = excluded.experience,

      education = excluded.education,

      salary = excluded.salary,

      salaryMinLpa = excluded.salaryMinLpa,

      salaryMaxLpa = excluded.salaryMaxLpa,

      logo = excluded.logo,

      color = excluded.color,

      posted = excluded.posted,

      description = excluded.description

  `);



  try {

    database.run("BEGIN TRANSACTION");



    for (const job of seedData.jobs) {

      const required = [

        job.id,

        job.title,

        job.company,

        job.location,

        job.type,

        job.experience,

        job.education,

        job.salary,

        job.salaryMinLpa,

        job.salaryMaxLpa,

        job.logo,

        job.color,

        job.posted,

        job.description

      ];



      if (

        required.some(

          (value) => value === undefined || value === null

        )

      ) {

        throw new Error(

          `Invalid or incomplete job record: ${job.id}`

        );

      }



      statement.run(required);

    }



    database.run("COMMIT");

    saveDatabase();



    console.log(

      `Database initialized with ${seedData.jobs.length} jobs.`

    );



  } catch (error) {

    database.run("ROLLBACK");

    throw error;



  } finally {

    statement.free();

  }

}



// Create the initial demo profile

database.run(`

  INSERT OR IGNORE INTO profiles (id)

  VALUES (1)

`);



// Import jobs from db.json

seedJobs();



// ======================================

// 5. DATABASE HEALTH CHECK

// ======================================



app.get("/api/health", (req, res) => {

  const counts = {

    jobs: getOne(

      "SELECT COUNT(*) AS total FROM jobs"

    ).total,



    profiles: getOne(

      "SELECT COUNT(*) AS total FROM profiles"

    ).total,



    savedJobs: getOne(

      "SELECT COUNT(*) AS total FROM saved_jobs"

    ).total,



    applications: getOne(

      "SELECT COUNT(*) AS total FROM applications"

    ).total

  };



  res.json({

    status: "OK",

    database: "SQLite",

    counts

  });

});



// ======================================

// 6. JOB API ROUTES

// ======================================



// Fetch all jobs

app.get("/api/jobs", (req, res) => {

  const jobs = getAll(

    "SELECT * FROM jobs ORDER BY id"

  );



  res.json(jobs);

});



// Fetch an individual job

app.get("/api/jobs/:id", (req, res) => {

  const id = Number(req.params.id);



  if (!Number.isInteger(id) || id <= 0) {

    return res.status(400).json({

      message: "Invalid job ID."

    });

  }



  const job = getOne(

    "SELECT * FROM jobs WHERE id = ?",

    [id]

  );



  if (!job) {

    return res.status(404).json({

      message: "Job not found."

    });

  }



  res.json(job);

});



// ======================================

// 7. PROFILE API ROUTES

// ======================================



app.get("/api/profile", (req, res) => {

  const profile = getOne(

    "SELECT * FROM profiles WHERE id = 1"

  );



  res.json(profile);

});



const allowedEducation = [

  "",

  "Diploma",

  "B.Tech - Computer Science",

  "B.Tech - Artificial Intelligence",

  "B.Tech - Information Technology",

  "B.Tech - Data Science",

  "B.Tech - Electronics",

  "B.E. - Computer Science",

  "BCA",

  "B.Sc. - Computer Science",

  "B.Sc. - Data Science",

  "M.Tech - Computer Science",

  "M.Tech - Artificial Intelligence",

  "M.Tech - Data Science",

  "M.E.",

  "MCA",

  "M.Sc.",

  "MBA",

  "PhD",

  "High School",

  "Other"

];



const allowedExperience = [

  "",

  "Fresher",

  "Less than 1 year",

  "1-3 years",

  "3-5 years",

  "5+ years"

];



const allowedLocations = [

  "All",

  "Bangalore",

  "Hyderabad",

  "Noida",

  "Pune"

];



// Save or update profile

app.put("/api/profile", (req, res) => {

  const body = req.body;



  if (

    !body ||

    typeof body !== "object" ||

    Array.isArray(body)

  ) {

    return res.status(400).json({

      message: "Invalid profile data."

    });

  }



  const fields = [

    "name",

    "email",

    "phone",

    "education",

    "skills",

    "experience",

    "preferredLocation",

    "about",

    "resumeFileName"

  ];



  const profile = {};



  for (const field of fields) {

    const value = body[field] ?? "";



    if (

      typeof value !== "string" ||

      value.length > 2000

    ) {

      return res.status(400).json({

        message: `Invalid value for ${field}.`

      });

    }



    profile[field] = value.trim();

  }



  if (!profile.name) {

    return res.status(400).json({

      message: "Full name is required."

    });

  }



  if (

    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)

  ) {

    return res.status(400).json({

      message: "Enter a valid email address."

    });

  }



  if (

    profile.education &&

    !allowedEducation.includes(profile.education)

  ) {

    return res.status(400).json({

      message: "Invalid education selection."

    });

  }



  if (!allowedExperience.includes(profile.experience)) {

    return res.status(400).json({

      message: "Invalid experience selection."

    });

  }



  if (!allowedLocations.includes(profile.preferredLocation)) {

    return res.status(400).json({

      message: "Invalid preferred location."

    });

  }



  execute(`

    UPDATE profiles SET

      name = ?,

      email = ?,

      phone = ?,

      education = ?,

      skills = ?,

      experience = ?,

      preferredLocation = ?,

      about = ?,

      resumeFileName = ?,

      updatedAt = ?

    WHERE id = 1

  `, [

    profile.name,

    profile.email,

    profile.phone,

    profile.education,

    profile.skills,

    profile.experience,

    profile.preferredLocation,

    profile.about,

    profile.resumeFileName,

    new Date().toISOString()

  ]);



  res.json({

    message: "Profile saved successfully.",

    profile: getOne(

      "SELECT * FROM profiles WHERE id = 1"

    )

  });

});



// ======================================

// 8. SAVED JOB API ROUTES

// ======================================



// Fetch bookmarked job IDs

app.get("/api/saved-jobs", (req, res) => {

  const rows = getAll(`

    SELECT jobId

    FROM saved_jobs

    WHERE profileId = 1

    ORDER BY createdAt DESC

  `);



  res.json({

    jobIds: rows.map((row) => Number(row.jobId))

  });

});



// Add a saved job

app.post("/api/saved-jobs", (req, res) => {

  const jobId = Number(req.body?.jobId);



  if (!Number.isInteger(jobId) || jobId <= 0) {

    return res.status(400).json({

      message: "A valid job ID is required."

    });

  }



  const job = getOne(

    "SELECT id FROM jobs WHERE id = ?",

    [jobId]

  );



  if (!job) {

    return res.status(404).json({

      message: "Job not found."

    });

  }



  execute(`

    INSERT OR IGNORE INTO saved_jobs (

      profileId,

      jobId

    )

    VALUES (1, ?)

  `, [jobId]);



  res.status(201).json({

    message: "Job saved successfully.",

    jobId

  });

});



// Remove a saved job

app.delete("/api/saved-jobs/:jobId", (req, res) => {

  const jobId = Number(req.params.jobId);



  if (!Number.isInteger(jobId) || jobId <= 0) {

    return res.status(400).json({

      message: "Invalid job ID."

    });

  }



  execute(`

    DELETE FROM saved_jobs

    WHERE profileId = 1 AND jobId = ?

  `, [jobId]);



  res.json({

    message: "Saved job removed."

  });

});



// ======================================

// 9. APPLICATION API ROUTES

// ======================================



// Fetch applications

app.get("/api/applications", (req, res) => {

  const applications = getAll(`

    SELECT *

    FROM applications

    WHERE profileId = 1

    ORDER BY appliedAt DESC

  `);



  res.json(applications);

});



// Apply for a job

app.post("/api/applications", (req, res) => {

  const jobId = Number(req.body?.jobId);



  if (!Number.isInteger(jobId) || jobId <= 0) {

    return res.status(400).json({

      message: "A valid job ID is required."

    });

  }



  const job = getOne(

    "SELECT * FROM jobs WHERE id = ?",

    [jobId]

  );



  if (!job) {

    return res.status(404).json({

      message: "Job not found."

    });

  }



  const existing = getOne(`

    SELECT id

    FROM applications

    WHERE profileId = 1 AND jobId = ?

  `, [jobId]);



  if (existing) {

    return res.status(409).json({

      message: "You have already applied to this job."

    });

  }



  const profile = getOne(

    "SELECT * FROM profiles WHERE id = 1"

  );



  const appliedAt = new Date().toISOString();



  execute(`

    INSERT INTO applications (

      profileId,

      jobId,

      jobTitle,

      company,

      location,

      salary,

      status,

      appliedAt,

      applicantName,

      applicantEmail,

      applicantPhone,

      applicantEducation,

      applicantSkills,

      applicantExperience

    )

    VALUES (

      1, ?, ?, ?, ?, ?, 'Applied', ?, ?, ?, ?, ?, ?, ?

    )

  `, [

    job.id,

    job.title,

    job.company,

    job.location,

    job.salary,

    appliedAt,

    profile.name,

    profile.email,

    profile.phone,

    profile.education,

    profile.skills,

    profile.experience

  ]);



  const application = getOne(`

    SELECT *

    FROM applications

    WHERE profileId = 1 AND jobId = ?

  `, [jobId]);



  res.status(201).json({

    message: "Application submitted successfully.",

    application

  });

});



// Update application status

app.patch("/api/applications/:id/status", (req, res) => {

  const id = Number(req.params.id);

  const status = req.body?.status;



  if (!Number.isInteger(id) || id <= 0) {

    return res.status(400).json({

      message: "Invalid application ID."

    });

  }



  const allowedStatuses = [

    "Applied",

    "Under Review",

    "Shortlisted",

    "Interview",

    "Selected",

    "Rejected"

  ];



  if (!allowedStatuses.includes(status)) {

    return res.status(400).json({

      message: "Invalid application status."

    });

  }



  const existing = getOne(`

    SELECT id

    FROM applications

    WHERE id = ? AND profileId = 1

  `, [id]);



  if (!existing) {

    return res.status(404).json({

      message: "Application not found."

    });

  }



  execute(`

    UPDATE applications

    SET status = ?

    WHERE id = ? AND profileId = 1

  `, [status, id]);



  const updated = getOne(

    "SELECT * FROM applications WHERE id = ?",

    [id]

  );



  res.json({

    message: "Application status updated.",

    application: updated

  });

});



// ======================================

// 10. ERROR HANDLING

// ======================================



app.use((req, res) => {

  res.status(404).json({

    message: "API endpoint not found."

  });

});



app.use((error, req, res, next) => {

  console.error("API error:", error);



  res.status(500).json({

    message: "An internal server error occurred."

  });

});



// ======================================

// 11. START SERVER

// ======================================



app.listen(PORT, "127.0.0.1", () => {

  console.log("--------------------------------");

  console.log("CareerNest API is running!");

  console.log(`API: http://localhost:${PORT}/api`);

  console.log(`Health: http://localhost:${PORT}/api/health`);

  console.log(`Database: ${databasePath}`);

  console.log("--------------------------------");

});
