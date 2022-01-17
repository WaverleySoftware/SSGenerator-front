const PROXY_CONFIG = [
  {
    context: ['/Api', '/api'],
    target: 'http://94.130.206.72:3080',
    // target: 'http://94.130.206.72:2080',
    secure: false,
    logLevel: "debug",
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
