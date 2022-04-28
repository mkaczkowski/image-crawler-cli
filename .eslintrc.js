module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest", // Allows the use of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
    },
    extends: ["plugin:@typescript-eslint/recommended"],
    env: {
        node: true, // Enable Node.js global variables
    },
};