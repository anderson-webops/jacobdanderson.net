import antfu from "@antfu/eslint-config";
// eslint.config.js – Flat-config style for ESLint v9+
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";

import tsParser from "@typescript-eslint/parser";
import vuePlugin from "eslint-plugin-vue";

import globals from "globals";
import vueParser from "vue-eslint-parser";


/** @type {import("eslint").FlatConfig[]} */
export default [
	
	/* ------------------------------------------------------------------ *
	 * 0️⃣  Base config from @antfu/eslint-config (gives us the “kitchen
	 *     sink” of sensible defaults: TypeScript, Vue 3, React-Hooks,
	 *     Stylistic-rules, Prettier-formatting for MD, YAML, etc.)
	 * ------------------------------------------------------------------ */
	...antfu({
		// === Antfu-specific switches ====================================
		unocss: true,      // enable UnoCSS rules if you’re using it
		// pnpm : true,    // uncomment if you’d like pnpm-specific linting
		// ---------------------------------------------------------------
		root: true,       // marks this as the project’s ESLint root
		env: {browser: true, es2021: true, node: true},
		
		/* stylistic preferences (indent → tab, quotes → double, etc.) */
		stylistic: {
			indent: "tab",
			quotes: "double",
			semi: true,
			linebreak: "unix",
		},
		
		/* Extra ignore globs beyond Antfu’s defaults */
		ignores: [
			"node_modules/**",
			"dist/**",
			"package-lock.json",
		],
		
		/* Fine-tune / turn off a few stylistic rules */
		rules: {
			"style/no-multiple-empty-lines": "off",
			"style/no-trailing-spaces": "off",
			// "style/object-curly-spacing": "off", // example placeholder
		},
		
		/* Markdown / CSS / HTML formatters */
		formatters: {
			css: true,        // format *.css
			html: true,        // format *.html / *.htm
			markdown: "prettier",  // format *.md using Prettier
		},
		
		/* Explicitly keep these ecosystems enabled */
		typescript: true,
		vue: true,
		yaml: true,
		jsonc: false,       // disable jsonc if you don’t need it
	}),
	
	/* ------------------------------------------------------------------ *
	 * 1️⃣  Plain JavaScript files (.js, .cjs, .mjs)
	 *     – Adds Node globals and the core @eslint/js “recommended” rules.
	 * ------------------------------------------------------------------ */
	{
		...js.configs.recommended,
		files: ["**/*.{js,cjs,mjs}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {...globals.node},
		},
	},
	
	/* ------------------------------------------------------------------ *
	 * 2️⃣  TypeScript files (.ts, .tsx if needed)
	 *     – Uses the TypeScript parser with your project’s tsconfig.json.
	 * ------------------------------------------------------------------ */
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: "./tsconfig.json",
				ecmaVersion: "latest",
				sourceType: "module",
			},
			globals: {...globals.node},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			/* ⬇ Put any TS-only rule overrides here */
			// "@typescript-eslint/explicit-function-return-type": "warn",
		},
	},
	
	/* ------------------------------------------------------------------ *
	 * 3️⃣  Vue Single-File Components (.vue)
	 *     – Vue parser as entry-point + TypeScript inside <script> blocks.
	 * ------------------------------------------------------------------ */
	{
		files: ["**/*.vue"],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsParser,    // <script> → TS parser
				ecmaVersion: "latest",
				sourceType: "module",
				extraFileExtensions: [".vue"],
			},
		},
		plugins: {vue: vuePlugin},
		rules: {
			// allow unused bindings in <script setup>
			"vue/no-unused-vars": "off",
		},
	},
	
	/* ------------------------------------------------------------------ *
	 * 4️⃣  Config scripts themselves (.eslintrc.js, vite.config.js, etc.)
	 *     – Lint them in CommonJS/Node “script” mode.
	 * ------------------------------------------------------------------ */
	{
		files: [".eslintrc.{js,cjs}", "vite.config.{js,ts}"],
		languageOptions: {sourceType: "script"},
		env: {node: true},
	},
	
	/* ------------------------------------------------------------------ *
	 * 5️⃣  Fallback ignore block (keeps Flat Config happy if you
	 *     accidentally duplicate ignore patterns elsewhere).
	 * ------------------------------------------------------------------ */
	{ignores: ["dist/**"]},
];
