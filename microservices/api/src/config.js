var projectConfig = {
  url: {
    data: 'http://data.hasura/v1/query',
  },
  cluster: 'brood19',
  intercom: {
    token: 'dG9rOmJjOGIwOTlkX2FkZTFfNDRmM19hNmNkX2ExZjE0YzVjODI3ZToxOjA='
  }
}

if (process.env.ENVIRONMENT === 'dev') {
  projectConfig.url.data = 'http://127.0.0.1:6432/v1/query';
}

module.exports = projectConfig;
