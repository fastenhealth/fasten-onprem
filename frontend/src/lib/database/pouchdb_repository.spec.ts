import {IDatabaseRepository} from './interface';
import {NewPouchdbRepositoryWebWorker} from './pouchdb_repository';
import {SourceType} from '../models/database/source_types';
import {Source} from '../models/database/source';
import {DocType} from './constants';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { v4 as uuidv4 } from 'uuid';
import {PouchdbCrypto} from './plugins/crypto';

describe('PouchdbRepository', () => {
  let repository: IDatabaseRepository;

  beforeEach(async () => {
    let current_user = uuidv4()
    let cryptoConfig = await PouchdbCrypto.CryptConfig(current_user, current_user)
    await PouchdbCrypto.StoreCryptConfig(cryptoConfig)
    repository = NewPouchdbRepositoryWebWorker(current_user, new PouchDB("PouchdbRepository" + current_user));
  });

  afterEach(async () => {
    if(repository){
      const db = await repository.GetDB()
      db.destroy() //wipe the db.
    }
  })


  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('CreateSource', () => {
    it('should return an id', async () => {
      const createdId = await repository.UpsertSource(new Source({
        patient: 'patient',
        source_type: SourceType.Aetna,
      }))

      expect(createdId.totalResources).toEqual(1);
      expect(createdId.updatedResources[0]).toEqual("source:aetna:patient");
    });
  })

  describe('GetSource', () => {
    it('should return an source', async () => {
      const createdResource = await repository.UpsertSource(new Source({
        patient: 'patient',
        source_type: SourceType.Aetna,
        access_token: 'hello-world',
      }))

      const createdSource = await repository.GetSource(createdResource.updatedResources[0])

      expect(createdSource.doc_type).toEqual(DocType.Source);
      expect(createdSource.patient).toEqual('patient');
      expect(createdSource.source_type).toEqual(SourceType.Aetna);
      expect(createdSource.access_token).toEqual('hello-world');
    });
  })

  describe('DeleteSource', () => {
    it('should delete a source', async () => {
      const createdResource = await repository.UpsertSource(new Source({
        patient: 'patient-to-delete',
        source_type: SourceType.Aetna,
        access_token: 'hello-world',
      }))
      console.log(createdResource)
      const deletedSource = await repository.DeleteSource(createdResource.updatedResources[0])

      expect(deletedSource).toBeTruthy();
    });
  })

  describe('GetSources', () => {
    it('should return a list of sources', async () => {
      await repository.UpsertSource(new Source({
        patient: 'patient1',
        source_type: SourceType.Aetna,
        access_token: 'hello-world1',
      }))

      await repository.UpsertSource(new Source({
        patient: 'patient2',
        source_type: SourceType.Aetna,
        access_token: 'hello-world2',
      }))

      await repository.UpsertSource(new Source({
        patient: 'patient3',
        source_type: SourceType.Aetna,
        access_token: 'hello-world3',
      }))

      const sourcesWrapped = await repository.GetSources()

      expect(sourcesWrapped.total_rows).toEqual(3);
      expect((sourcesWrapped.rows[0] as Source).patient).toEqual('patient1');
    });
  })
});
