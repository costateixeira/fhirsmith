const { OCLValueSetProvider } = require('../../tx/ocl/vs-ocl');

describe('OCLValueSetProvider', () => {
  it('should instantiate with default config', () => {
    const provider = new OCLValueSetProvider();
    expect(provider).toBeTruthy();
  });

  // Adicione mais testes para métodos públicos e fluxos de erro
});
