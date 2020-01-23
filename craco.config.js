module.exports = {
  babel: {
    plugins: [
      "@glimmerx/babel-plugin-component-templates",
      ["@babel/plugin-proposal-decorators", { legacy: true }]
    ]
  }
};
