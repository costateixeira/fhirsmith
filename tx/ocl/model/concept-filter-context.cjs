class OCLConceptFilterContext {
  constructor() {
    this.concepts = [];
    this.currentIndex = -1;
  }

  add(concept, rating = 0) {
    this.concepts.push({ concept, rating });
  }

  sort() {
    this.concepts.sort((a, b) => b.rating - a.rating);
  }

  size() {
    return this.concepts.length;
  }

  hasMore() {
    return this.currentIndex + 1 < this.concepts.length;
  }

  next() {
    if (!this.hasMore()) {
      return null;
    }
    this.currentIndex += 1;
    return this.concepts[this.currentIndex].concept;
  }

  reset() {
    this.currentIndex = -1;
  }

  findConceptByCode(code) {
    for (const item of this.concepts) {
      if (item.concept && item.concept.code === code) {
        return item.concept;
      }
    }
    return null;
  }

  containsConcept(concept) {
    return this.concepts.some(item => item.concept === concept);
  }
}

module.exports = {
  OCLConceptFilterContext
};
