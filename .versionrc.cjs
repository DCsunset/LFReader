const re = /version = "v(\d\.\d\.\d)"/;

function jsonTracker(filename) {
  return {
	  filename,
    type: "json"
  };
}

const frontendTracker = {
	filename: "frontend/src/_version.ts",
	updater: {
		readVersion: (contents) => contents.match(re)[1],
		writeVersion: (contents, version) => contents.replace(re, `version = "v${version}"`)
	}
};

module.exports = {
  types: [
    {"type": "feat", "section": "Features"},
    {"type": "fix", "section": "Bug Fixes"},
    {"type": "chore", "section": "Misc"},
    {"type": "docs", "section": "Misc"},
    {"type": "style", "section": "Misc"},
    {"type": "refactor", "section": "Misc"},
    {"type": "perf", "section": "Misc"},
    {"type": "test", "section": "Misc"},
    {"type": "ci", "section": "Misc"},
    {"type": "build", "section": "Misc"}
  ],
	// read version
	packageFiles: [ jsonTracker("frontend/package.json") ],
	// write version
	bumpFiles: [ jsonTracker("frontend/package.json"), jsonTracker("frontend/package-lock.json"), frontendTracker ]
};
