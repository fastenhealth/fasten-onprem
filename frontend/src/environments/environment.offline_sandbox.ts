export const environment = {
  production: true,
  environment_cloud: false,
  environment_desktop: true,
  environment_name: "sandbox",
  popup_source_auth: false,

  lighthouse_api_endpoint_base: 'http://localhost:4000',
  // lighthouse_api_endpoint_base: 'https://lighthouse.fastenhealth.com/sandboxbeta',

  //used to specify the api server that we're going to use (can be relative or absolute). Must not have trailing slash
  fasten_api_endpoint_base: '/api',

  search: true,
  chat: true
};
