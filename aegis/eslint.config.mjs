import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  {
    // This object contains the rules we are disabling.
    rules: {
      // Turns off the error for using 'any'
      '@typescript-eslint/no-explicit-any': 'off',

      // Turns off the error for using 'require()' imports
      '@typescript-eslint/no-require-imports': 'off',

      // Turns off the warning about missing dependencies in useEffect
      'react-hooks/exhaustive-deps': 'off',

      // Turns off the warning for unused variables
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];

export default eslintConfig;
