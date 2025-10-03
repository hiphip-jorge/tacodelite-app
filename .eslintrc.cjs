/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
    },
    ignorePatterns: ['dist/', '*.min.js'],
    overrides: [
        {
            files: ['lambda/**/*.js'],
            env: {
                node: true,
                es2021: true,
            },
            parserOptions: {
                sourceType: 'script',
            },
            globals: {
                require: 'readonly',
                exports: 'readonly',
                module: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
            rules: {
                'no-unused-vars': 'warn',
            },
        },
        {
            files: ['mocks/**/*.js'],
            env: {
                node: true,
                es2021: true,
            },
            parserOptions: {
                sourceType: 'module',
            },
            rules: {
                'no-unused-vars': 'warn',
            },
        },
        {
            files: [
                '*.config.js',
                '*.config.cjs',
                'vite.config.js',
                'tailwind.config.js',
                'postcss.config.js',
            ],
            env: {
                node: true,
            },
            parserOptions: {
                sourceType: 'module',
            },
        },
        {
            files: [
                '**/*.test.js',
                '**/*.test.jsx',
                '**/test/**/*.js',
                '**/test/**/*.jsx',
                '**/__tests__/**/*.js',
                '**/__tests__/**/*.jsx',
                'src/test/**/*.js',
            ],
            env: {
                browser: true,
                node: true,
            },
            globals: {
                vi: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
    ],
};
