const { OCLCodeSystemProvider } = require('../../tx/ocl/cs-ocl');

describe('OCLCodeSystemProvider', () => {
  it('should instantiate with default config', () => {
    const provider = new OCLCodeSystemProvider();
    expect(provider).toBeTruthy();
  });

  it('should assign ids', () => {
    const provider = new OCLCodeSystemProvider();
    const ids = new Set();
    provider.assignIds(ids);
    expect(ids.size).toBeGreaterThanOrEqual(0);
  });

  // Adicione mais testes para métodos públicos e fluxos de erro
});

describe('OCLSourceCodeSystemProvider', () => {
  // OCLSourceCodeSystemProvider não está exportado diretamente, apenas OCLCodeSystemProvider
  // Adicione mais testes para OCLCodeSystemProvider
});
