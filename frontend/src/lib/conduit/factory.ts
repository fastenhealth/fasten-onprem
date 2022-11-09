import {SourceType} from '../models/database/source_types';
import {Source} from '../models/database/source';
import {IClient} from './interface';

import {HealthITClient} from './fhir/sandbox/healthit_client';
import {LogicaClient} from './fhir/sandbox/logica_client';
import {AthenaClient} from './fhir/sandbox/athena_client';

import {CareEvolutionClient} from './fhir/platforms/careevolution_client';
import {CernerClient} from './fhir/platforms/cerner_client';
import {EpicClient} from './fhir/platforms/epic_client';

import {AetnaClient} from './fhir/aetna_client';
import {BlueButtonClient} from './fhir/bluebutton_client';
import {CignaClient} from './fhir/cigna_client';
import {ClientConfig} from '../models/client/client-config';

export function NewClient(sourceType: SourceType, source: Source, clientConfig: ClientConfig): IClient {

  switch(sourceType) {

    //sandbox
    case SourceType.Athena:
      return new AthenaClient(source, clientConfig)
    case SourceType.HealthIT:
      return new HealthITClient(source, clientConfig)
    case SourceType.Logica:
      return new LogicaClient(source, clientConfig )

    //platforms
    case SourceType.CareEvolution:
      return new CareEvolutionClient(source, clientConfig)
    case SourceType.Cerner:
      return new CernerClient(source, clientConfig)
    case SourceType.Epic:
      return new EpicClient(source, clientConfig)

    //providers
    case SourceType.Aetna:
      return new AetnaClient(source, clientConfig)

    case SourceType.Amerigroup:
    case SourceType.AmerigroupMedicaid:
    case SourceType.Anthem:
    case SourceType.AnthemBluecrossCA:
    case SourceType.BluecrossBlueshieldKansasMedicare:
    case SourceType.BluecrossBlueshieldKansas:
    case SourceType.BluecrossBlueshieldNY:
    case SourceType.BlueMedicareAdvantage:
    case SourceType.ClearHealthAlliance:
    case SourceType.DellChildrens:
    case SourceType.EmpireBlue:
    case SourceType.EmpireBlueMedicaid:
    case SourceType.HealthyBlueLA:
    case SourceType.HealthyBlueLAMedicaid:
    case SourceType.HealthyBlueMO:
    case SourceType.HealthyBlueMOMedicaid:
    case SourceType.HealthyBlueNC:
    case SourceType.HealthyBlueNCMedicaid:
    case SourceType.HealthyBlueNE:
    case SourceType.HealthyBlueSC:
    case SourceType.HighmarkWesternNY:
    case SourceType.SimplyHealthcareMedicaid:
    case SourceType.SimplyHealthcareMedicare:
    case SourceType.SummitCommunityCare:
    case SourceType.Unicare:
    case SourceType.UnicareMA:
    case SourceType.UnicareMedicaid:
      return new CareEvolutionClient(source, clientConfig)

    case SourceType.Cigna:
      return new CignaClient(source, clientConfig)
    case SourceType.BlueButton:
      return new BlueButtonClient(source, clientConfig)

    // case SourceType.Manual:
    //   return new ManualClient(source)
    default:
      throw new Error(`Unknown Source Type: ${sourceType}`)
  }
}
