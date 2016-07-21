'use strict';

const fs = require('fs');

function updateFileContents(pathToFile, contentTransformer) {

  return new Promise((resolve, reject) => {

    fs.readFile(pathToFile, 'utf8', (readErr, contents) => {

      if (readErr) reject(readErr);

      const newContents = contentTransformer(contents);
      fs.writeFile(pathToFile, newContents, (writeErr) => {
        if (writeErr) reject(writeErr);
        resolve();
      });
    });
  });
}

module.exports.updateReadmeAdocVersion = (readmeAdocPath, version) => {

  return updateFileContents(readmeAdocPath, (readmeAdocContents) => {
    return readmeAdocContents.replace(/^:release-version: .*$/m, `:release-version: ${version}`);
  });
};

module.exports.updatePackageJsonVersion = (packageJsonPath, version) => {

  return updateFileContents(packageJsonPath, (packageJson) => {
    const packageJsonObject = JSON.parse(packageJson);
    packageJsonObject.version = version;
    return JSON.stringify(packageJsonObject, null, '  ');
  });
};
