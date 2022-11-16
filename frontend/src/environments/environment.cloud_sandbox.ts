export const environment = {
  production: true,
  environment_cloud: true,
  environment_name: "sandbox",
  lighthouse_api_endpoint_base: 'https://lighthouse.fastenhealth.com/sandbox',

  //used to specify the couchdb server that we're going to use (can be relative or absolute). Must not have trailing slash
  couchdb_endpoint_base: 'https://couchdb.sandbox.fastenhealth.com',

  //used to specify the api server that we're going to use (can be relative or absolute). Must not have trailing slash
  fasten_api_endpoint_base: 'https://api.sandbox.fastenhealth.com/v1',
};
