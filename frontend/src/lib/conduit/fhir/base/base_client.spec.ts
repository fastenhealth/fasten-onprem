
import {BaseClient} from './base_client';
import {Source} from '../../../models/database/source';

class TestClient extends BaseClient {
  constructor(source: Source) {
    super(source);
  }
}

describe('BaseClient', () => {
  let client: TestClient;

  beforeEach(async () => {
    client = new TestClient(new Source({
      "authorization_endpoint": "https://auth.logicahealth.org/authorize",
      "token_endpoint": "https://auth.logicahealth.org/token",
      "introspection_endpoint": "https://auth.logicahealth.org/introspect",
      "userinfo_endpoint": "",
      "scopes_supported": ["openid", "fhirUser", "patient/*.read", "offline_access"],
      "issuer": "https://auth.logicahealth.org",
      "grant_types_supported": ["authorization_code"],
      "response_types_supported": ["code"],
      "aud": "",
      "code_challenge_methods_supported": ["S256"],
      "api_endpoint_base_url": "https://api.logicahealth.org/fastenhealth/data",
      "client_id": "12b14c49-a4da-42f7-9e6f-2f19db622962",
      "redirect_uri": "https://lighthouse.fastenhealth.com/sandbox/callback/logica",
      "confidential": false,
      "source_type": "logica",
      "patient": "smart-1288992",
      "access_token": "xxx.xxx.xxx",
      "refresh_token": "xxx.xxx.",
      "expires_at": 1664949030,
    }));
  });

  it('should be created', () => {
    expect(client).toBeTruthy();
  });

  describe('GetRequest', () => {
    it('should make an authorized request', async () => {
      const resp = await client.GetRequest("Patient/smart-1288992")

      expect(resp).toEqual({
        resourceType: "Patient",
        id: "source:aetna:patient"
      });
    });
  })


})
