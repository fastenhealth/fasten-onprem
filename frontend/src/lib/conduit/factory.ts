import {SourceType} from '../models/database/source_types';
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
import {ClientConfig} from '../models/client/client-config';

export function NewClient(sourceType: SourceType, source: Source, clientConfig: ClientConfig): IClient {

  switch(sourceType) {
    case SourceType.Aetna:
      return new AetnaClient(source, clientConfig)
    case SourceType.Athena:
      return new AthenaClient(source, clientConfig)
    case SourceType.BlueButtonMedicare:
      return new BlueButtonClient(source, clientConfig)
    case SourceType.CareEvolution:
      return new CareEvolutionClient(source, clientConfig)
    case SourceType.Cerner:
      return new CernerClient(source, clientConfig)
    case SourceType.Cigna:
      return new CignaClient(source, clientConfig)
    case SourceType.Epic:
      return new EpicClient(source, clientConfig)
    case SourceType.HealthIT:
      return new HealthITClient(source, clientConfig)
    case SourceType.Logica:
      return new LogicaClient(source, clientConfig )
    // case SourceType.Manual:
    //   return new ManualClient(source)
    default:
      throw new Error(`Unknown Source Type: ${sourceType}`)
  }
}
