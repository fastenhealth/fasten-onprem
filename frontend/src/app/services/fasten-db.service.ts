import { Injectable } from '@angular/core';
import {PouchdbRepository} from '../../lib/database/pouchdb_repository';
@Injectable({
  providedIn: 'root'
})
export class FastenDbService extends PouchdbRepository {
  constructor() {
    super("fasten");
  }
}
