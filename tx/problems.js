
class ProblemFinder {

  constructor() {
    this.map = new Map();
  }

  async scanValueSets(provider) {
    let unknownVersions = {};  // system -> Set of versions not known to the server
    for (let vsp of provider.valueSetProviders) {
      let list = await vsp.listAllValueSets();
      for (let url of list) {
        let vs = await vsp.fetchValueSet(url);
        if (vs && vs.jsonObj.compose) {
          await this.scanValueSet(vs.jsonObj.compose, unknownVersions, vs.jsonObj.status != 'retired');
        }
      }
    }
    // Filter to only versions the server doesn't know about
    for (const [system, vset] of Object.entries(unknownVersions)) {
      for (let v of [...vset]) {
        if (await provider.hasCsVersion(system, v)) {
          vset.delete(v);
        }
      }
      if (vset.size === 0) {
        delete unknownVersions[system];
      }
    }
    return this.unknownVersionsHtml(unknownVersions);
  }

  unknownVersionsHtml(unknownVersions) {
    const entries = Object.entries(unknownVersions || {});
    if (entries.length === 0) {
      return '<p>No unknown system versions found.</p>';
    }
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    let html = '<table class="grid"><thead><tr><th>System</th><th>Unknown Versions</th></tr></thead><tbody>';
    for (const [system, vset] of entries) {
      const versions = [...vset].sort((a, b) => a.localeCompare(b)).join('<br/>');
      html += `<tr><td>${system}</td><td>${versions}</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
  }

  async scanValueSet(compose, versions, active) {
    for (let inc of compose.include || []) {
      if (inc.system) {
        if (active && inc.version) {
          this.seeVersion(versions, inc.system, inc.version);
        }
      }
    }
  }

  seeVersion(versions, system, version) {
    let set = versions[system];
    if (set == null) {
      set = new Set();
      versions[system] = set;
    }
    set.add(version);
  }
}

module.exports = ProblemFinder;