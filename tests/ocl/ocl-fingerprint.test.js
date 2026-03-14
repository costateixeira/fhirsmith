const { computeValueSetExpansionFingerprint } = require('../../tx/ocl/fingerprint/fingerprint');
describe('fingerprint', () => {
  it('should compute fingerprint for concept', () => {
    const expansion = { contains: [{ system: 'sys', code: 'A', display: 'Alpha', inactive: false }] };
    const fp = computeValueSetExpansionFingerprint(expansion);
    expect(typeof fp).toBe('string');
    expect(fp.length).toBeGreaterThan(0);
  });

  // Adicione mais testes para edge cases
});
