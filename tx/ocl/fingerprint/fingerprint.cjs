const crypto = require('crypto');

function hashSortedLines(lines) {
  const hash = crypto.createHash('sha256');
  for (const line of lines.sort()) {
    hash.update(line);
    hash.update('\n');
  }
  return hash.digest('hex');
}

function computeCodeSystemFingerprint(concepts) {
  if (!Array.isArray(concepts) || concepts.length === 0) {
    return null;
  }

  const normalized = concepts
    .map(concept => {
      if (!concept || !concept.code) {
        return null;
      }

      const code = String(concept.code || '');
      const display = String(concept.display || '');
      const definition = String(concept.definition || '');
      const retired = concept.retired === true ? '1' : '0';
      return `${code}|${display}|${definition}|${retired}`;
    })
    .filter(Boolean);

  if (normalized.length === 0) {
    return null;
  }

  return hashSortedLines(normalized);
}

function computeValueSetExpansionFingerprint(expansion) {
  if (!expansion || !Array.isArray(expansion.contains) || expansion.contains.length === 0) {
    return null;
  }

  const normalized = expansion.contains
    .map(entry => {
      if (!entry || !entry.code) {
        return null;
      }

      const system = String(entry.system || '');
      const code = String(entry.code || '');
      const display = String(entry.display || '');
      const inactive = entry.inactive === true ? '1' : '0';
      return `${system}|${code}|${display}|${inactive}`;
    })
    .filter(Boolean);

  if (normalized.length === 0) {
    return null;
  }

  return hashSortedLines(normalized);
}

module.exports = {
  computeCodeSystemFingerprint,
  computeValueSetExpansionFingerprint
};
