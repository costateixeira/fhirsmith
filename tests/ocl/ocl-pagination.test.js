const { extractItemsAndNext } = require('../../tx/ocl/http/pagination');

describe('pagination', () => {
  it('should extract items and next from array', () => {
    const result = extractItemsAndNext([1,2,3]);
    expect(result.items).toEqual([1,2,3]);
    expect(result.next).toBeNull();
  });

  it('should extract items and next from object', () => {
    const result = extractItemsAndNext({ results: [4,5], next: '/next' });
    expect(result.items).toEqual([4,5]);
    expect(result.next).toBe('/next');
  });

  // Adicione mais testes para fetchAllPages com mocks
});
