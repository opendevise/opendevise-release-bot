#!/usr/bin/env node

'use strict';

const argv = require('./argv-config');

const fs = require('fs');
const path = require('path');
const semver = require('semver')
const NodeGit = require('nodegit');

const { getPackageJsonVersion } = require('./node-module');
const { updatePackageJsonVersion, updateReadmeAdocVersion } = require('./fs-updaters');
const { commitAllChanges, pushRef, resetHard } = require('./git');

const projectPath = process.cwd();
const repoPath = path.join(projectPath, '.git');
const packageJsonPath = path.join(projectPath, 'package.json');
const packageReadmePath = path.join(projectPath, 'README.adoc');

const execa = require('execa');

NodeGit.Repository.open(repoPath)
  .then((repo) => {
    return Promise.all([
      repo,
      getPackageJsonVersion(packageJsonPath),
      repo.getMasterCommit(),
    ])
  })
  .then(([repo, currentVersion, masterCommit]) => {

    const tagVersion = semver.inc(currentVersion, argv.mode);
    const newPreVersion = semver.inc(tagVersion, 'patch') + '-pre';

    return execa('npm', ['test'])
      .then(() => updatePackageJsonVersion(packageJsonPath, tagVersion))
      .then(() => updateReadmeAdocVersion(packageReadmePath, tagVersion))
      .then(() => execa('gulp', ['deploy']))
      .then(() => commitAllChanges(repo, masterCommit, `Release v${tagVersion}`))
      .then((oid) => repo.createTag(oid, tagVersion, tagVersion))
      .then(() => execa('npm', ['publish']))
      .then(() => {
        if (argv.nopush) return;
        return pushRef(repo, `tags/${tagVersion}`);
      })
      .then(() => resetHard(repo, masterCommit))
      .then(() => updatePackageJsonVersion(packageJsonPath, newPreVersion))
      .then(() => updateReadmeAdocVersion(packageReadmePath, newPreVersion))
      .then(() => commitAllChanges(repo, masterCommit, `Updating the master version to ${newPreVersion}`))
      .then(() => {
        if (argv.nopush) return;
        return pushRef(repo, 'heads/master');
      });
  })
  .catch((err) => console.log(err));
