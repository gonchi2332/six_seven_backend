export default {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  // Asegura que recolecte coverage de los archivos TS y no de los tests
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
