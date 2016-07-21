'use strict';

const fs = require('fs');

module.exports.getPackageJsonVersion = function (pathToPackageJson) {

  return new Promise((resolve, reject) => {

    fs.readFile(pathToPackageJson, 'utf8', (readErr, packageJson) => {

      if (readErr) reject(readErr);
      var packageJsonObject = JSON.parse(packageJson);
      resolve(packageJsonObject.version);
    });
  });
};
