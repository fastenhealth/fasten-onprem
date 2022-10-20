import { Injectable } from '@angular/core';
import {PouchdbRepository} from '../../lib/database/pouchdb_repository';
import {User} from '../../lib/models/fasten/user';
import {ResponseWrapper} from '../models/response-wrapper';
import {HttpClient} from '@angular/common/http';
import {Summary} from '../../lib/models/fasten/summary';
import {DocType} from '../../lib/database/constants';
import {ResourceTypeCounts} from '../../lib/models/fasten/source-summary';
import {Base64} from '../../lib/utils/base64';


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
PouchDB.plugin(PouchAuth);

@Injectable({
  providedIn: 'root'
})
export class FastenDbService extends PouchdbRepository {

  constructor(private _httpClient: HttpClient) {
    super();
  }


  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Auth methods
  /**
   * Signin (and Signup) both require an "online" user.
   * @param username
   * @param pass
   * @constructor
   */
  public async Signin(username: string, pass: string): Promise<any> {

    let remotePouchDb = new PouchDB(this.getRemoteUserDb(username), {skip_setup: true});
    return await remotePouchDb.logIn(username, pass)
      .then((loginResp)=>{
        this.current_user = loginResp.name
        return this.postLoginHook(loginResp.name, remotePouchDb)
      })
      .catch((err) => {
        console.error("an error occurred during login/setup", err)
        throw err
      })
  }

  /**
   * Signup  (and Signin) both require an "online" user.
   * @param newUser
   * @constructor
   */
  public async Signup(newUser?: User): Promise<any> {
    console.log("STARTING SIGNUP")
    let resp = await this._httpClient.post<ResponseWrapper>(`${this.getBasePath()}/api/auth/signup`, newUser).toPromise()
    console.log(resp)
    return this.Signin(newUser.username, newUser.password);
  }

  public async Logout(): Promise<any> {

    // let remotePouchDb = new PouchDB(this.getRemoteUserDb(localStorage.getItem("current_user")), {skip_setup: true});
    if(this.pouchDb){
      await this.pouchDb.logOut()
    }
    await this.Close()
  }

  /**
   * Try to get PouchDB database using session information
   * @constructor
   */
  public override async GetSessionDB(): Promise<PouchDB.Database>  {
    if(this.pouchDb){
      console.log("Session DB already exists..")
      return this.pouchDb
    }

    //Since we dont have a pre-configured pouchDB already, see if we have an active session to the remote database.
    let sessionDb = new PouchDB(this.getRemoteUserDb("placeholder"))
    const session = await sessionDb.getSession()
    console.log("Session found...", session)

    const authUser = session?.userCtx?.name
    if(authUser){
      this.pouchDb = new PouchDB(this.getRemoteUserDb(authUser))
      this.current_user = authUser
    }
    return this.pouchDb
  }

  //TODO: now that we've moved to remote-first database, we can refactor and simplify this function significantly.
  public async IsAuthenticated(): Promise<boolean> {

    try{
      //lets see if we have an active session to the remote database.
      await this.GetSessionDB()
      if(!this.pouchDb){
        console.warn("could not determine database from session info, logging out")
        return false
      }

      let session = await this.pouchDb.getSession()
      let authUser = session?.userCtx?.name
      let isAuth = !!authUser
      console.warn("IsAuthenticated? getSession() ====> ", isAuth)
      return isAuth;

    } catch (e) {
      return false
    }
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

  /////////////////////////////////////////////////////////////////////////////////////////////////
  //Private Methods
  /////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * After user login:
   * - set the current_user in localStorage
   * - create a (new/existing) local database,
   * - enable indexes
   * - enable sync
   * - (TODO) enable encryption
   * @param userIdentifier
   * @constructor
   */
  private async postLoginHook(userIdentifier: string, pouchDb: PouchDB.Database): Promise<void> {

    await this.Close();
    this.pouchDb = pouchDb;

    //create any necessary indexes
    // this index allows us to group by source_resource_type
    console.log("DB createIndex started...")
    //todo, we may need to wait a couple of moments before starting this index, as the database may not exist yet (even after user creation)
    await (new Promise((resolve) => setTimeout(resolve, 500))) //sleep for 0.5s.
    const createIndexMsg = await this.pouchDb.createIndex({
      index: {fields: [
          'doc_type',
          'source_resource_type',
        ]}
    });
    console.log("DB createIndex complete", createIndexMsg)

    // if(sync){
    //   console.log("DB sync init...", userIdentifier, this.getRemoteUserDb(userIdentifier))
    //
    //   // this.enableSync(userIdentifier)
    //   //   .on('paused', function (info) {
    //   //     // replication was paused, usually because of a lost connection
    //   //     console.warn("replication was paused, usually because of a lost connection", info)
    //   //   }).on('active', function (info) {
    //   //   // replication was resumed
    //   //   console.warn("replication was resumed", info)
    //   // }).on('error', function (err) {
    //   //   // totally unhandled error (shouldn't happen)
    //   //   console.error("replication unhandled error (shouldn't happen)", err)
    //   // });
    //   console.log("DB sync enabled")
    //
    // }

    console.warn( "Configured PouchDB database for,", this.pouchDb.name );
    return
  }

}
