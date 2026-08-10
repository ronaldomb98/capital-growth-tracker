import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['.agents/**', '.next/**', 'out/**', 'node_modules/**']
  }
];

export default config;
