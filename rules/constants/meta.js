const { repository, version } = require("../../package.json");

/** Plugin namespace used in the bundled configs (`<namespace>/<rule>`). */
const PLUGIN_NAMESPACE = "sort-properties-angular";

const repoUrl = repository.url.replace(/^git\+/, "").replace(/\.git$/, "");

/** @param {string} rule */
const ruleDocUrl = (rule) => `${repoUrl}/blob/v${version}/docs/rules/${rule}.md`;

module.exports = { PLUGIN_NAMESPACE, repoUrl, ruleDocUrl, version };
