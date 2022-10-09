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
PouchDB.plugin(PouchAuth);

@Injectable({
  providedIn: 'root'
})
export class FastenDbService extends PouchdbRepository {

  //TODO: move most of this functionality back into the lib as a separate file.
  replicationHandler: any
  remotePouchEndpoint: string // "http://localhost:5984"
  constructor(private _httpClient: HttpClient) {
    const userIdentifier = localStorage.getItem("current_user")
    super(userIdentifier, "my-secret-encryption-key");
    this.remotePouchEndpoint = `${window.location.protocol}//${window.location.host}${this.getBasePath()}/database`
    if(userIdentifier){
      this.enableSync(userIdentifier)
    }
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
        return this.postLoginHook(loginResp.name, true)
      })
      .catch((err) => console.error("an error occured during login/setup", err))
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
    localStorage.removeItem("current_user")
    await this.Close()
  }
  public async IsAuthenticated(): Promise<boolean> {
    if(!this.localPouchDb){
      console.warn("IsAuthenticated? ====> logout, no local database present")
      //if no local database available, we're always "unauthenticated".
      return false
    }
    if(!localStorage.getItem("current_user")){
      console.warn("IsAuthenticated? ====> logout, no current_user set")
      return false
    }
    try{
      //if we have a local database, lets see if we have an active session to the remote database.
      const remotePouchDb = new PouchDB(this.getRemoteUserDb(localStorage.getItem("current_user")), {skip_setup: true});
      const session = await remotePouchDb.getSession()
      const isAuth = !!session?.userCtx?.name
      console.warn("IsAuthenticated? getSession() ====> ", isAuth)

      return isAuth
    } catch (e) {
      return false
    }
  }

  public Close(): Promise<void> {
    // Stop remote replication for existing database
    if(this.replicationHandler){
      this.replicationHandler.cancel()
    }
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
        })
      })
      .then((results) => results.docs)

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
  private async postLoginHook(userIdentifier: string, sync: boolean = false): Promise<void> {
    localStorage.setItem("current_user", userIdentifier)

    await this.Close();
    this.localPouchDb = new PouchDB(userIdentifier);

    //create any necessary indexes
    // this index allows us to group by source_resource_type
    console.log("DB createIndex started...")
    const createIndexMsg = await this.localPouchDb.createIndex({
      index: {fields: [
          'doc_type',
          'source_resource_type',
        ]}
    });
    console.log("DB createIndex complete", createIndexMsg)

    if(sync){
      this.enableSync(userIdentifier)
    }

    console.warn( "Configured PouchDB database for,", this.localPouchDb.name );
    return
  }
  private enableSync(userIdentifier: string){
    console.log("DB sync init...", userIdentifier, this.getRemoteUserDb(userIdentifier))
    this.replicationHandler = this.localPouchDb.sync(this.getRemoteUserDb(userIdentifier))
    console.log("DB sync enabled")
  }

  private getRemoteUserDb(username: string){
    return `${this.remotePouchEndpoint}/userdb-${this.toHex(username)}`
  }
  private toHex(s: string) {
    // utf8 to latin1
    s = unescape(encodeURIComponent(s))
    let h = ''
    for (let i = 0; i < s.length; i++) {
      h += s.charCodeAt(i).toString(16)
    }
    return h
  }

  private getBasePath(): string {
    return window.location.pathname.split('/web').slice(0, 1)[0];
  }
}
