const { app, sequelize } = require('./server/app');
const port = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});

module.exports = app;
