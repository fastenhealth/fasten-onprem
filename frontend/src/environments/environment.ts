// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  //javascript environment, not Fasten env.
  production: false,

  // is the application running in the cloud? (enables 3rd party IdP's and token based couchdb authentication)
  environment_cloud: false,

  // the environment name, `sandbox`, `prod`, `beta`
  environment_name: "sandbox",

  //specify the lighthouse server that we're going to use to authenticate against all our source/providers. Must not have trailing slash
  lighthouse_api_endpoint_base: 'https://lighthouse.fastenhealth.com/sandbox',

  //used to specify the couchdb server that we're going to use (can be relative or absolute). Must not have trailing slash
  // couchdb_endpoint_base: 'https://couchdb.sandbox.fastenhealth.com',
  // if relative, must start with /
  couchdb_endpoint_base: '/database',

  //used to specify the api server that we're going to use (can be relative or absolute). Must not have trailing slash
  // fasten_api_endpoint_base: 'https://api.sandbox.fastenhealth.com/v1',
  // if relative, must start with /
  fasten_api_endpoint_base: '/api',
};
