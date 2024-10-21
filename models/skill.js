const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: { type: String, required: true } // Beginner, Intermediate, Expert
});

const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;
