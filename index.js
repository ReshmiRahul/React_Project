const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Project = require('./models/project'); 
const Skill = require('./models/skill');     

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up the view engine (Pug)
app.set('view engine', 'pug');

// Connect to MongoDB using environment variables
const mongoURI = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DBHOST}?retryWrites=true&w=majority`;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});


// Admin Routes (render forms)
app.get('/admin/projects', (req, res) => {
  res.render('addProject');
});

app.get('/admin/skills', (req, res) => {
  res.render('addSkill');
});

app.post('/admin/projects', async (req, res) => {
  const { name, description, technologies, githubLink, liveLink} = req.body; 
  const project = new Project({
    name,
    description,
    technologies: technologies.split(','),
    githubLink,
    liveLink
  });
  await project.save();
  res.redirect('/admin/projects');
});


app.post('/admin/skills', async (req, res) => {
  const { name, proficiency } = req.body;
  const skill = new Skill({ name, proficiency });
  await skill.save();
  res.redirect('/admin/skills');
});

// API Endpoints (return JSON)
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.get('/api/skills', async (req, res) => {
  const skills = await Skill.find();
  res.json(skills);
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.render('projects', { projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    return res.status(500).render('error', { message: 'Error fetching projects' }); // Render an error page
  }
});

app.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.render('skills', { skills });
  } catch (err) {
    console.error('Error fetching skills:', err);
    return res.status(500).render('error', { message: 'Error fetching skills' }); // Render an error page
  }
});


// Delete a project by ID
app.delete('/admin/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id); // Delete the project
    res.status(200).send('Project deleted successfully');
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle project deletion
app.post('/admin/projects/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await Project.findByIdAndDelete(id); // Delete the project
    res.redirect('/projects'); // Redirect back to the projects list
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle DELETE request for skills
app.post('/admin/skills/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await Skill.findByIdAndDelete(id);
    res.redirect('/skills');
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Render edit form for skills
app.get('/admin/skills/:id/edit', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).send('Skill not found');
    }
    res.render('editSkill', { skill });
  } catch (err) {
    console.error('Error fetching skill for edit:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle PUT request for updating a skill
app.post('/admin/skills/:id', async (req, res) => {
  const { id } = req.params;
  const { name, proficiency } = req.body;
  try {
    await Skill.findByIdAndUpdate(id, { name, proficiency });
    res.redirect('/admin/skills');
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Render edit form for projects
app.get('/admin/projects/:id/edit', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send('Project not found');
    }
    res.render('editProject', { project });
  } catch (err) {
    console.error('Error fetching project for edit:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle PUT request for updating a project
app.post('/admin/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, technologies, githubLink, liveLink } = req.body;
  try {
    await Project.findByIdAndUpdate(id, {
      name,
      description,
      technologies: technologies.split(','),
      githubLink,
      liveLink
    });
    res.redirect('/projects');
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
