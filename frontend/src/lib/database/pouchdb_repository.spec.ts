import {IDatabaseRepository} from './interface';
import {NewRepositiory} from './pouchdb_repository';
import {SourceType} from '../../app/models/database/types';
import {Source} from '../../app/models/database/source';
import {DocType} from './constants';

describe('PouchdbRepository', () => {
  let repository: IDatabaseRepository;

  beforeEach(async () => {
    repository = NewRepositiory();
  });

  afterEach(async () => {
    if(repository){
      await repository.GetDB().destroy() //wipe the db.
    }
  })


  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('CreateSource', () => {
    it('should return an id', async () => {
      const createdId = await repository.CreateSource(new Source({
        patient: 'patient',
        source_type: SourceType.Aetna,
      }))

      expect(createdId).toEqual("source:aetna:patient");
    });
  })

  describe('GetSource', () => {
    it('should return an source', async () => {
      const createdId = await repository.CreateSource(new Source({
        patient: 'patient',
        source_type: SourceType.Aetna,
        access_token: 'hello-world',
      }))

      const createdSource = await repository.GetSource(createdId)

      expect(createdSource.docType).toEqual(DocType.Source);
      expect(createdSource.patient).toEqual('patient');
      expect(createdSource.source_type).toEqual(SourceType.Aetna);
      expect(createdSource.access_token).toEqual('hello-world');
    });
  })

  describe('DeleteSource', () => {
    it('should delete a source', async () => {
      const createdId = await repository.CreateSource(new Source({
        patient: 'patient-to-delete',
        source_type: SourceType.Aetna,
        access_token: 'hello-world',
      }))
      console.log(createdId)
      const deletedSource = await repository.DeleteSource(createdId)

      expect(deletedSource).toBeTruthy();
    });
  })

  describe('GetSources', () => {
    it('should return a list of sources', async () => {
      await repository.CreateSource(new Source({
        patient: 'patient1',
        source_type: SourceType.Aetna,
        access_token: 'hello-world1',
      }))

      await repository.CreateSource(new Source({
        patient: 'patient2',
        source_type: SourceType.Aetna,
        access_token: 'hello-world2',
      }))

      await repository.CreateSource(new Source({
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
