import {FHIR401Client} from './fhir401_r4_client';
import {Source} from '../../../models/database/source';
import {IResourceBundleRaw} from '../../interface';
import {ResourceFhir} from '../../../models/database/resource_fhir';
import {NewPouchdbRepositoryWebWorker} from '../../../database/pouchdb_repository';
import {Base64} from '../../../utils/base64';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
import * as FHIR401Client_ProcessBundle from './fixtures/FHIR401Client_ProcessBundle.json';
import {IDatabaseRepository} from '../../../database/interface';
import {PouchdbCrypto} from '../../../database/plugins/crypto';
import {ClientConfig} from '../../../models/client/client-config';


class TestClient extends FHIR401Client {
  constructor(source: Source) {
    super(source, new ClientConfig());
  }

  public async ProcessBundle(bundle: IResourceBundleRaw): Promise<ResourceFhir[]> {
    return super.ProcessBundle(bundle);
  }
}

describe('FHIR401Client', () => {
  let client: TestClient;

  beforeEach(async () => {
    client = new TestClient(new Source({
      "_id": "source:aetna:12345",
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

  describe('ProcessBundle', () => {
    it('should correctly wrap each BundleEntry with ResourceFhir', async () => {

      //setup

      //test
      const resp = await client.ProcessBundle(FHIR401Client_ProcessBundle)
      //expect
      expect(resp.length).toEqual(206);
      expect(resp[0].source_resource_id).toEqual("c088b7af-fc41-43cc-ab80-4a9ab8d47cd9");
      expect(resp[0].source_resource_type).toEqual("Patient");
    });
  })

  describe('SyncAll', () => {
    let repository: IDatabaseRepository;

    beforeEach(async () => {
      let current_user = uuidv4()
      let cryptoConfig = await PouchdbCrypto.CryptConfig(current_user, current_user)
      await PouchdbCrypto.StoreCryptConfig(cryptoConfig)
      repository = NewPouchdbRepositoryWebWorker(current_user, '/database', new PouchDB("FHIR401Client-"+ current_user));
    });

    afterEach(async () => {
      if(repository){
        const db = await repository.GetDB()
        db.destroy() //wipe the db.
      }
    })
    it('should correctly add resources to the database', async () => {
      //setup
      let response = new Response(JSON.stringify(FHIR401Client_ProcessBundle));
      Object.defineProperty(response, "url", { value: `${client.source.api_endpoint_base_url}/Patient/${client.source.patient}/$everything`});
      spyOn(window, "fetch").and.returnValue(Promise.resolve(response));

      //test
      const resp = await client.SyncAll(repository)
      const firstResourceFhir = resp.updatedResources[0]
      const resourceIdParts = firstResourceFhir.split(":")

      //expect
      expect(resp.totalResources).toEqual(206);
      expect(resp.updatedResources.length).toEqual(206);
      expect(firstResourceFhir).toEqual('resource_fhir:b64.c291cmNlOmFldG5hOjEyMzQ1:Patient:c088b7af-fc41-43cc-ab80-4a9ab8d47cd9');
      expect(Base64.Decode(resourceIdParts[1])).toEqual("source:aetna:12345");


    }, 10000);
  })

})
