module.exports = {
    root: true,
    env: {
        es2021: true,
    },
    extends: ["@nuxt/eslint-config", "plugin:tailwindcss/recommended", "plugin:prettier/recommended"],
    rules: {
        "vue/multi-word-component-names": "off",
        "vue/no-multiple-template-root": "off",
    },
};
