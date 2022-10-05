import {IDatabaseRepository} from '../database/interface';

export interface IClient {
  GetRequest(resourceSubpath: string): Promise<any>
  SyncAll(db: IDatabaseRepository): Promise<any>

  //Manual client ONLY functions
  SyncAllBundle(db: IDatabaseRepository, bundleFile: any): Promise<any>
}

export interface IResourceInterface {
  resourceType: string
  id?: string
}
