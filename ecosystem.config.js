module.exports = {
  apps: [
    {
      name: 'FrasersWebsite',
      script: $(which http-server),
      args: ['-p', '8080', '-d', 'false', './dist/frasers-website/'],
      user: 'your_username',
    },
  ],
};
