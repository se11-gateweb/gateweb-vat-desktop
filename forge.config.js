module.exports = {
  packagerConfig: {
    asar: true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin','win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devContentSecurityPolicy: "connect-src 'self' http://34.80.79.216:8080 ws://127.0.0.1:17777 http://localhost:8081d 'unsafe-eval'",
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/image.html',
              js: './src/image.js',
              name: 'second_window',
              preload: {
                js: './src/image_preload.js',
              },
            }
          ],
          "nodeIntegration": true,
        },
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'se11-gateweb',
          name: 'gateweb-vat-desktop'
        },
        prerelease: true
      }
    }
  ]
};
