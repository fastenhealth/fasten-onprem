// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  environment_cloud: false,
  environment_desktop: false,
  environment_name: "sandbox",
  popup_source_auth: false,

  lighthouse_api_endpoint_base: 'https://lighthouse.fastenhealth.com/sandbox',

  //used to specify the api server that we're going to use (can be relative or absolute). Must not have trailing slash
  fasten_api_endpoint_base: '/api',

  search: true,
  chat: true,

  typesense_config: {
    nodes: [
      {
        host: 'localhost',
        port: 8108,
        protocol: 'http',
      },
    ],
    connectionTimeoutSeconds: 180,
    apiKey: 'xyz123',
  },
};
