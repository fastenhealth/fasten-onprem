import {BaseClient} from './base_client';
import {Source} from '../../../models/database/source';

// @ts-ignore
import * as BaseClient_GetRequest from './fixtures/BaseClient_GetRequest.json';
// @ts-ignore
import * as BaseClient_GetFhirVersion from './fixtures/BaseClient_GetFhirVersion.json';
import {ClientConfig} from '../../../models/client/client-config';


class TestClient extends BaseClient {
  constructor(source: Source) {
    super(source, new ClientConfig());
  }
}

describe('BaseClient', () => {
  let client: TestClient;

  beforeEach(async () => {
    client = new TestClient(new Source({
      "authorization_endpoint": "https://fhirsandbox.healthit.gov/open/r4/authorize",
      "token_endpoint": "https://fhirsandbox.healthit.gov/open/r4/token",
      "introspection_endpoint": "",
      "issuer": "https://fhirsandbox.healthit.go",
      "api_endpoint_base_url": "https://fhirsandbox.healthit.gov/secure/r4/fhir",
      "client_id": "9ad3ML0upIMiawLVdM5-DiPinGcv7M",
      "redirect_uri": "https://lighthouse.fastenhealth.com/sandbox/callback/healthit",
      "confidential": false,
      "source_type": "healthit",
      "patient": "placeholder",
      "access_token": "2e1be8c72d4d5225aae264a1fb7e1d3e",
      "refresh_token": "",
      "expires_at": 16649837100, //aug 11, 2497 (for testing)
    }));
  });

  it('should be created', () => {
    expect(client).toBeTruthy();
  });

  describe('GetRequest', () => {
    it('should make an authorized request', async () => {

      //setup
      let response = new Response(JSON.stringify(BaseClient_GetRequest));
      Object.defineProperty(response, "url", { value: `${client.source.api_endpoint_base_url}/Patient/${client.source.patient}`});
      spyOn(window, "fetch").and.returnValue(Promise.resolve(response));

      //test
      const resp = await client.GetRequest(`Patient/${client.source.patient}`)

      //expect
      expect(resp.resourceType).toEqual("Patient");
      expect(resp.id).toEqual("123d41e1-0f71-4e9f-8eb2-d1b1330201a6");
    });
  })

  describe('GetFhirVersion', () => {
    it('should make an authorized request', async () => {
      //setup
      let response = new Response(JSON.stringify(BaseClient_GetFhirVersion));
      Object.defineProperty(response, "url", { value: `${client.source.api_endpoint_base_url}/metadata`});
      spyOn(window, "fetch").and.returnValue(Promise.resolve(response));

      //test
      const resp = await client.GetFhirVersion()

      //expect
      expect(resp).toEqual("4.0.1");
    });
  });


})
