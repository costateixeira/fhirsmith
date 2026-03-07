function toConceptContext(concept) {
  if (!concept || typeof concept !== 'object') {
    return null;
  }

  const code = concept.code || concept.id || null;
  if (!code) {
    return null;
  }

  return {
    code,
    display: concept.display_name || concept.display || concept.name || null,
    definition: concept.description || concept.definition || null,
    retired: concept.retired === true,
    designations: extractDesignations(concept)
  };
}

function extractDesignations(concept) {
  const result = [];
  const seen = new Set();

  const add = (language, value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) {
      return;
    }

    const lang = typeof language === 'string' ? language.trim() : '';
    const key = `${lang}|${text}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push({ language: lang, value: text });
  };

  if (Array.isArray(concept.names)) {
    for (const entry of concept.names) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }

      add(entry.locale || entry.language || entry.lang || '', entry.name || entry.display_name || entry.display || entry.value || entry.term);
    }
  }

  if (concept.display_name || concept.display || concept.name) {
    add(concept.locale || concept.default_locale || concept.language || '', concept.display_name || concept.display || concept.name);
  }

  if (concept.locale_display_names && typeof concept.locale_display_names === 'object') {
    for (const [lang, value] of Object.entries(concept.locale_display_names)) {
      add(lang, value);
    }
  }

  return result;
}

module.exports = {
  toConceptContext,
  extractDesignations
};
