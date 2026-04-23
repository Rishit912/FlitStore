module.exports = async (req, res) => {
  try {
    const [{ default: connectDB }, { default: app }] = await Promise.all([
      import('../server/config/db.js'),
      import('../server/index.js'),
    ]);

    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('API bootstrap error:', error);
    return res.status(500).json({
      message: error.message || 'Server initialization failed',
    });
  }
};
