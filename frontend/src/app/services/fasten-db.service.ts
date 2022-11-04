import { Injectable } from '@angular/core';
import {PouchdbRepository} from '../../lib/database/pouchdb_repository';
import {User} from '../../lib/models/fasten/user';
import {ResponseWrapper} from '../models/response-wrapper';
import {HttpClient} from '@angular/common/http';
import {Summary} from '../../lib/models/fasten/summary';
import {DocType} from '../../lib/database/constants';
import {ResourceTypeCounts} from '../../lib/models/fasten/source-summary';
import {Base64} from '../../lib/utils/base64';
import * as jose from 'jose'

// PouchDB & plugins (must be similar to the plugins specified in pouchdb repository)
import * as PouchDB from 'pouchdb/dist/pouchdb';
import find from 'pouchdb-find';
PouchDB.plugin(find); //does not work in
import * as PouchUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchUpsert);
import * as PouchCrypto from 'crypto-pouch';
PouchDB.plugin(PouchCrypto);
import PouchAuth from 'pouchdb-authentication'
import {PouchdbCrypto} from '../../lib/database/plugins/crypto';
import {environment} from '../../environments/environment';
import {GetEndpointAbsolutePath} from '../../lib/utils/endpoint_absolute_path';
import {AuthService} from './auth.service';
PouchDB.plugin(PouchAuth);

@Injectable({
  providedIn: 'root'
})
export class FastenDbService extends PouchdbRepository {


  // There are 3 different ways to initialize the Database
  // - explicitly after signin/signup
  // - explicitly during web-worker init (not supported by this class, see PouchdbRepository.NewPouchdbRepositoryWebWorker)
  // - implicitly after Lighthouse redirect (when user is directed back to the app)
  // Three peices of information are required during intialization
  // - couchdb endpoint (constant, see environment.couchdb_endpoint_base)
  // - username
  // - JWT token
  constructor(private _httpClient: HttpClient, private authService: AuthService) {
    super(environment.couchdb_endpoint_base);
  }


  /**
   * Try to get PouchDB database using token auth information
   * This method must handle 2 types of authentication
   * - pouchdb init after signin/signup
   * - implicit init after lighthouse redirect
   * @constructor
   */
  public override async GetSessionDB(): Promise<PouchDB.Database>  {
    if(this.pouchDb){
      console.log("Session DB already exists..")
      return this.pouchDb
    }

    //check if we have a JWT token (we should, otherwise the auth-guard would have redirected to login page)
    let authToken = this.authService.GetAuthToken()
    if(!authToken){
      throw new Error("no auth token found")
    }

    //parse the authToken to get user information
    this.current_user = this.authService.GetCurrentUser().sub

    // add JWT bearer token header to all requests
    // https://stackoverflow.com/questions/62129654/how-to-handle-jwt-authentication-with-rxdb
    this.pouchDb = new PouchDB(this.getRemoteUserDb(this.current_user), {
      fetch: function (url, opts) {
        opts.headers.set('Authorization', `Bearer ${authToken}`)
        return PouchDB.fetch(url, opts);
      }
    })
    return this.pouchDb
  }

  /**
   * Is the crypto configuration for the authenticated user already available in the browser? Or do we need to import/generate new config.
   */
  public async isCryptConfigAvailable(): Promise<boolean>{
    try {
      await this.GetSessionDB()
      let cryptConfig = await PouchdbCrypto.RetrieveCryptConfig(this.current_user)

      return !!cryptConfig
    }catch(e){
      return false
    }
  }


  public Close(): Promise<void> {
    return super.Close()
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Summary

  public async GetSummary(): Promise<Summary> {
    const summary = new Summary()
    summary.sources = await this.GetSources()
      .then((paginatedResp) => paginatedResp.rows)

    // summary.patients = []
    summary.patients = await this.GetDB()
      .then((db) => {

        return db.find({
          selector: {
            doc_type: DocType.ResourceFhir,
            source_resource_type: "Patient",
          }
        }).then((results) => {
            return Promise.all((results.docs || []).map((doc) => PouchdbCrypto.decryptDocument(db, doc)))
          })
      })


    summary.resource_type_counts = await this.findDocumentByPrefix(`${DocType.ResourceFhir}`, false)
      .then((paginatedResp) => {
        const lookup: {[name: string]: ResourceTypeCounts} = {}
        paginatedResp?.rows.forEach((resourceWrapper) => {
          const resourceIdParts = resourceWrapper.id.split(':')
          const resourceType = resourceIdParts[2]

          let currentResourceStats = lookup[resourceType] || {
            count: 0,
            source_id: Base64.Decode(resourceIdParts[1]),
            resource_type: resourceType
          }
          currentResourceStats.count += 1
          lookup[resourceType] = currentResourceStats
        })

        const arr = []
        for(let key in lookup){
          arr.push(lookup[key])
        }
        return arr
      })


    return summary
  }
}
