// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['build/**', 'coverage/**', 'node_modules/**'],
  },

  // Base: reglas recomendadas de JS + TypeScript con información de tipos
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      // ─── Seguridad en producción: promesas ───────────────────────────
      // Una promesa rechazada sin manejar tumba el proceso de Node.
      '@typescript-eslint/no-floating-promises': 'error',
      // Promesas pasadas a callbacks que no las esperan (ej. express handlers, setInterval).
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      // `return promise` dentro de try/catch se salta el catch: obliga el await.
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      'no-promise-executor-return': 'error',

      // ─── Seguridad en producción: errores ────────────────────────────
      // Solo lanzar Error (conserva stack trace y lo entienden los middlewares).
      '@typescript-eslint/only-throw-error': 'error',
      'no-unsafe-finally': 'error',

      // ─── Seguridad en producción: tipos / null ───────────────────────
      // Los `any` desactivan el chequeo de tipos: aquí nacen los "cannot read property of undefined".
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      // switch sobre unions/enums debe cubrir todos los casos.
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      // ─── Lógica que suele esconder bugs ──────────────────────────────
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-fallthrough': 'error',
      'no-self-compare': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'array-callback-return': 'error',
      'no-constructor-return': 'error',
      'default-case-last': 'error',
      curly: ['error', 'all'],

      // ─── Calidad (autocorregibles con lint:fix) ──────────────────────
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',
    },
  },

  // Archivos JS de configuración (jest.config.js, eslint.config.mjs...): sin chequeo de tipos
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },

  // Tests: los mocks de jest usan any y promesas sueltas con frecuencia
  {
    files: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
);
