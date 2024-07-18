// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        "@nuxt/ui",
        "@nuxtjs/i18n",
        "@nuxtjs/eslint-module",
        "@sidebase/nuxt-auth",
        "@nuxt/image",
        "@nuxtjs/tailwindcss",
        "@nuxtjs/color-mode",
    ],
    colorMode: {
        classSuffix: "",
        preference: "light",
    },
    runtimeConfig: {
        public: {
            apiURL: "url here",
        },
    },
    i18n: {
        langDir: "./lang",
        locales: [
            { code: "en", file: "en-GB.json" },
            { code: "cy", file: "cy.json" },
            { code: "ko", file: "ko.json" },
        ],
        defaultLocale: "en",
    },
});
