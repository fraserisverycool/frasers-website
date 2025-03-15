module.exports = {
  apps: [
    {
      name: 'FrasersWebsite',
      script: '/run/user/1000/fnm_multishells/3531_1742024969347/bin/node',
      args: [
        '/run/user/1000/fnm_multishells/3531_1742024969347/bin/http-server',
        '-p',
        '8080',
        '-d',
        'false',
        './dist/frasers-website/',
      ],
      user: 'fraserbowen',
    },
  ],
};
