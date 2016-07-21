'use strict';

const NodeGit = require('nodegit');

module.exports.commitAllChanges = function (repo, parentCommit, message) {

  return repo.refreshIndex().then((indexResult) => {

    return indexResult.addAll()
      .then(() => indexResult.write())
      .then(() => indexResult.writeTree())
      .then((oid) => {
        const signature = repo.defaultSignature();
        return repo.createCommit('HEAD', signature, signature, message, oid, [parentCommit]);
      });
  });
};

module.exports.pushRef = function (repo, ref) {

  return repo.getRemote('origin').then((remote) => {
    return remote.push([`refs/${ref}:refs/${ref}`], {
      callbacks: {
        credentials: (url, userName) => {
          return NodeGit.Cred.sshKeyFromAgent(userName);
        }
      }
    });
  });
};

module.exports.resetHard = function (repo, commit) {
  return NodeGit.Reset.reset(repo, commit, NodeGit.Reset.TYPE.HARD);
};
