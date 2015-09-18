"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var Q = require('q');

var getProjectMetaDataByName = require('../lib/specifications/projectMetaData').getByName;
var updateProject = require('../lib/specifications/getProject').update;
var changeBranch = require('../lib/specifications/getProject').changeBranch;

// List of available features in a project.
router.get('/:projectName', function(req, res, next) {

  var projectName = req.params.projectName;

  // Query param causing a Git update (pull).
  var projectShouldUpdate = (req.query.update === 'true');

  // Query param indicating that it should be attempted
  // to check out the specified branch.
  var targetBranchName = req.query.branch || false;

  // Render the project page and send to client.
  function render(projectData) {
    var data = {
      renderingOptions: {}
    };

    if (projectData) {
      data['project'] = projectData;
    }

    res.render('project', data);
  }

  function passError(err) {
    next(err)
  }

  // If the update flag is set then branch change requests will be ingored.
  if (projectShouldUpdate) {
    updateProject(projectName)
      .then(function() {
        return getProjectMetaDataByName(projectName);
      })
      .then(render)
      .catch(passError);

  // Change the branch.
  } else if (targetBranchName) {
    changeBranch(projectName, targetBranchName)
      .then(function() {
        return getProjectMetaDataByName(projectName);
      })
      .then(render)
      .catch(passError);

  // Else, generate the metadata and render the page.
  } else {
    getProjectMetaDataByName(projectName)
      .then(render)
      .catch(passError);
  }
});

module.exports = router;