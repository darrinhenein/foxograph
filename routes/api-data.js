"use strict";

var mongoose = require('mongoose');
var error = require('./api-utils').error;

var Bug = mongoose.model('Bug', new mongoose.Schema({
  number: String,
  x: Number,
  y: Number,
  mockup: String
}));

var Mockup = mongoose.model('Mockup', new mongoose.Schema({
  image: String,
  project: String
}));

var Project = mongoose.model('Project', new mongoose.Schema({
  name: String,
  creationDate: Date,
  user: String
}));


// Projects.

exports.getProjects = function(req, res) {
  console.log('Getting all projects');
  return Project.find(function(err, projects) {
    console.log(JSON.stringify(projects));
    return res.json(projects);
  });
};

exports.postProject = function(req, res) {
  if (!req.session.email)
    return error(res, 'Not logged in.');
  if (!req.body || !req.body.name)
    return error(res, 'Missing name.');
  console.log('Creating project:');
  req.body.user = req.session.email;
  req.body.creationDate = new Date();
  console.log(req.body);
  var project = new Project(req.body);
  console.log(project);
  console.log(mongoose);
  project.save(function (err) {
    if (err) {
      return error(res, err, console);
    }
    return res.json(project);
  });
};

exports.getProject = function(req, res) {
  console.log('Getting project '+req.params.project_id);
  return Project.find({_id: req.params.project_id}, function(err, projects) {
    if (err)
      return error(res, err, console);
    console.log(JSON.stringify(projects[0]));
    return res.json(projects[0]);
  });
};

exports.deleteProject = function(req, res) {
  if (!req.session.email)
    return error(res, 'Not logged in.');
  console.log('Deleting project '+req.params.project_id);
  Project.findOne({_id: req.params.project_id}, function(err, project) {
    if (project.user !== req.session.email)
      return error(res, 'Cannot delete a project you didn’t create!');

    // Delete all the mockups and bugs for this project.
    Mockup.find({project: req.params.project_id}, function(err, mockups) {
      if (err)
        return error(res, err, console);
      mockups.forEach(function (mockup) {
        console.log('  Deleting mockup '+mockup._id);
        Bug.find({mockup: mockup._id}).remove();
      });
    }).remove();

    // Delete the project itself!
    Project.findOneAndRemove({_id: req.params.project_id}, function(err, project) {
      if (err)
        return error(res, err, console);
      console.log(JSON.stringify(project));
      return res.json(project);
    });
  });
};


// Mockups.

exports.getMockups = function(req, res) {
  console.log('Looking for mockups for project '+req.params.project_id);
  return Mockup.find({project: req.params.project_id}, function(err, mockups) {
    if (err)
      return error(res, err, console);
    // console.log(JSON.stringify(mockups));
    return res.json(mockups);
  });
};

exports.postMockup = function(req, res) {
  if (!req.session.email)
    return error(res, 'Not logged in.');
  if (!req.body || !req.body.image)
    return error(res, 'Missing image.');
  Project.findOne({_id: req.body.project}, function(err, project) {
    if (project.user !== req.session.email)
      return error(res, 'Cannot add a mockup to a project you didn’t create!');
    console.log('Creating mockup:');
    console.log(req.body);
    var mockup = new Mockup(req.body);
    console.log(mockup);
    mockup.save(function (err) {
      if (err)
        return error(res, err, console);
      return res.json(mockup);
    });
  });
};

exports.getMockup = function(req, res) {
  console.log('Getting mockup '+req.params.mockup_id);
  return Mockup.find({_id: req.params.mockup_id}, function(err, mockups) {
    if (err)
      return error(res, err, console);
    console.log(JSON.stringify(mockups[0]));
    return res.json(mockups[0]);
  });
};

exports.putMockup = function(req, res) {
  if (!req.session.email)
    return error(res, 'Not logged in.');
  if (!req.body || !req.body.image)
    return error(res, 'Missing image.');
  Project.findOne({_id: req.body.project}, function(err, project) {
    if (project.user !== req.session.email)
      return error(res, 'Cannot update a mockup in a project you didn’t create!');
    console.log('Updating mockup:');
    console.log(req.body);
    var id = req.body._id;
    delete req.body._id;
    Mockup.update({_id:id}, req.body, function(err, num) {
      if (err)
        return error(res, err, console);
      return res.json({});
    });
  });
};


// Bugs.

exports.getBugs = function(req, res) {
  console.log('Looking for bugs for mockup '+req.params.mockup_id);
  return Bug.find({mockup: req.params.mockup_id}, function(err, bugs) {
    if (err)
      return error(res, err, console);
    console.log(JSON.stringify(bugs));
    return res.json(bugs);
  });
};

exports.postBug = function(req, res) {
  if (!req.session.email)
    return error(res, 'Not logged in.');
  if (!req.body || !req.body.number)
    return error(res, 'Missing number.');
  Mockup.findOne({_id: req.body.mockup}, function(err, mockup) {
    Project.findOne({_id: mockup.project}, function(err, project) {
      if (project.user !== req.session.email)
        return error(res, 'Cannot add a bug to a project you didn’t create!');
      console.log('Creating bug:');
      console.log(req.body);
      var bug = new Bug(req.body);
      console.log(bug);
      bug.save(function (err) {
        if (err)
          return error(res, err, console);
        return res.json(bug);
      });
    });
  });
};

exports.getBug = function(req, res) {
  console.log('Getting bug '+req.params.bug_id);
  return Bug.find({_id: req.params.bug_id}, function(err, bugs) {
    if (err)
      return error(res, err, console);
    console.log(JSON.stringify(bugs));
    return res.json(bugs[0]);
  });
};

exports.deleteBug = function(req, res) {
  if (!req.session.email)
    return error(res, 'Not logged in.');
  console.log('Deleting bug '+req.params.bug_id);
  Bug.findOne({_id: req.params.bug_id}, function(err, bug) {
    Mockup.findOne({_id: bug.mockup}, function(err, mockup) {
      Project.findOne({_id: mockup.project}, function(err, project) {
        if (project.user !== req.session.email)
          return error(res, 'Cannot delete a bug from a project you didn’t create!');
        bug.remove();
      });
    });
  });
};

