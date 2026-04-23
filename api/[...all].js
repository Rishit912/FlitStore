module.exports = async (req, res) => {
  const { default: app } = await import('../server/index.js');
  return app(req, res);
};
