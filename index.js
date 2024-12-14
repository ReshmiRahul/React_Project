const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Project = require('./models/project'); 
const Skill = require('./models/skill');     
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB using environment variables
const mongoURI = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DBHOST}?retryWrites=true&w=majority`;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Portfolio API' });
});

// Admin Routes (render forms for testing, return JSON now)
app.get('/admin/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);  // Return all projects in JSON format
});

app.get('/admin/skills', async (req, res) => {
  const skills = await Skill.find();
  res.json(skills);  // Return all skills in JSON format
});

app.post('/admin/projects', async (req, res) => {
  const { name, description, technologies, githubLink, liveLink } = req.body;
  const project = new Project({
    name,
    description,
    technologies: technologies.split(','),
    githubLink,
    liveLink
  });
  await project.save();
  res.json({ message: 'Project added successfully', project });  // Return JSON response
});

app.post('/admin/skills', async (req, res) => {
  const { name, proficiency } = req.body;
  const skill = new Skill({ name, proficiency });
  await skill.save();
  res.json({ message: 'Skill added successfully', skill });  // Return JSON response
});

// API Endpoints (return JSON)
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);  // Return projects in JSON format
});

app.get('/api/skills', async (req, res) => {
  const skills = await Skill.find();
  res.json(skills);  // Return skills in JSON format
});

// Delete a project by ID
app.delete('/admin/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);  // Delete project
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });  // Return JSON response
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a skill by ID
app.delete('/admin/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);  // Delete skill
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json({ message: 'Skill deleted successfully' });  // Return JSON response
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Render edit form for skills (using GET, return skill data in JSON)
app.get('/admin/skills/:id/edit', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json({ skill });  // Return skill data in JSON format
  } catch (err) {
    console.error('Error fetching skill for edit:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Handle PUT request for updating a skill (now POST, return JSON)
app.post('/admin/skills/:id', async (req, res) => {
  const { id } = req.params;
  const { name, proficiency } = req.body;
  try {
    const updatedSkill = await Skill.findByIdAndUpdate(id, { name, proficiency }, { new: true });
    res.json({ message: 'Skill updated successfully', updatedSkill });  // Return JSON response
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Render edit form for projects (using GET, return project data in JSON)
app.get('/admin/projects/:id/edit', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ project });  // Return project data in JSON format
  } catch (err) {
    console.error('Error fetching project for edit:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Handle PUT request for updating a project (now POST, return JSON)
app.post('/admin/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, technologies, githubLink, liveLink } = req.body;
  try {
    const updatedProject = await Project.findByIdAndUpdate(id, {
      name,
      description,
      technologies: technologies.split(','),
      githubLink,
      liveLink
    }, { new: true });
    res.json({ message: 'Project updated successfully', updatedProject });  // Return JSON response
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
