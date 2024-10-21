const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], required: true },
  githubLink: String,
  liveLink: String
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
