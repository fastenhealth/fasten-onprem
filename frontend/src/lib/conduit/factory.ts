import {SourceType} from '../models/database/types';
import {Source} from '../models/database/source';
import {IClient} from './interface';
import {AetnaClient} from './fhir/aetna_client';
import {BlueButtonClient} from './fhir/bluebutton_client';
import {CareEvolutionClient} from './fhir/careevolution_client';
import {CernerClient} from './fhir/cerner_client';
import {AthenaClient} from './fhir/athena_client';
import {CignaClient} from './fhir/cigna_client';
import {EpicClient} from './fhir/epic_client';
import {HealthITClient} from './fhir/healthit_client';
import {LogicaClient} from './fhir/logica_client';

export function NewClient(sourceType: SourceType, source: Source): IClient {

  switch(sourceType) {
    case SourceType.Aetna:
      return new AetnaClient(source)
    case SourceType.Athena:
      return new AthenaClient(source)
    case SourceType.BlueButtonMedicare:
      return new BlueButtonClient(source)
    case SourceType.CareEvolution:
      return new CareEvolutionClient(source)
    case SourceType.Cerner:
      return new CernerClient(source)
    case SourceType.Cigna:
      return new CignaClient(source)
    case SourceType.Epic:
      return new EpicClient(source)
    case SourceType.HealthIT:
      return new HealthITClient(source)
    case SourceType.Logica:
      return new LogicaClient(source)
    // case SourceType.Manual:
    //   return new ManualClient(source)
    default:
      throw new Error(`Unknown Source Type: ${sourceType}`)
  }
}
