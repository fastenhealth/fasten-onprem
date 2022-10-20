// This is a Typescript module that recreates the functionality defined in https://github.com/calvinmetcalf/crypto-pouch/blob/master/index.js
// This file only exists because the PouchDB crypto plugin must work in both the browser and web-worker environment (where `window` is
// undefined and causes errors).
// Also, crypto-pouch does not support storing encrypted data in the remote database by default, which I'm attempting to do by commenting out the
// NO_COUCH error.
//
// We've attempted to use the Typescript Module Plugin/Augmentation pattern to modify the global `pouchdb` object, however that
// failed for a variety of reasons, so instead we're using a PouchdbCrypto class with static methods to re-implement the crypto logic
//
//
// See:
// - https://github.com/calvinmetcalf/crypto-pouch/blob/master/index.js
// - https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-plugin-d-ts.html
// - https://www.typescriptlang.org/docs/handbook/declaration-merging.html
// - https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-plugin-d-ts.html
// - https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html
// - https://stackoverflow.com/questions/35074713/extending-typescript-global-object-in-node-js
// - https://github.com/Microsoft/TypeScript/issues/15818

import * as Crypt from 'garbados-crypt';
import { openDB, deleteDB, wrap, unwrap } from 'idb';

// const Crypt = require()

const LOCAL_ID = '_local/crypto'
const IGNORE = ['_id', '_rev', '_deleted', '_conflicts']

// const NO_COUCH = 'crypto-pouch does not work with pouchdb\'s http adapter. Use a local adapter instead.'

export class PouchdbCryptoOptions {
  ignore?: string[]
}

export class PouchdbCryptConfig {
  username: string
  key: string
  config: string
}


export class PouchdbCrypto {
  private static async localIdb(){
    const dbPromise = openDB('crypto-store', 1, {
      upgrade(db) {
        db.createObjectStore('crypto');
      },
    });

    return await dbPromise
  }


  public static async CryptConfig(key: string, username): Promise<PouchdbCryptConfig>{
    const _crypt = new Crypt(key)
    let exportString = await _crypt.export()
    return {username: username, key: key, config: exportString}
  }

  public static async StoreCryptConfig(cryptConfig: PouchdbCryptConfig) {
    const localDb = await PouchdbCrypto.localIdb()
    await localDb.put('crypto', JSON.stringify(cryptConfig), `encryption_data_${cryptConfig.username}`)
  }

  public static async RetrieveCryptConfig(currentUser: string): Promise<PouchdbCryptConfig>{
    const localDb = await PouchdbCrypto.localIdb()
    let cryptConfigStr = await localDb.get('crypto',`encryption_data_${currentUser}`)
    if(!cryptConfigStr){
      throw new Error("crypto configuration not set")
    }
    return JSON.parse(cryptConfigStr) as PouchdbCryptConfig
  }
  public static async DeleteCryptConfig(currentUser: string): Promise<void>{
    const localDb = await PouchdbCrypto.localIdb()
    return await localDb.delete('crypto',`encryption_data_${currentUser}`)
  }


  public static async crypto(db, cryptConfig: PouchdbCryptConfig, options: PouchdbCryptoOptions = {}) {
    // if (db.adapter === 'http') {
    //   throw new Error(NO_COUCH)
    // }
    // if (typeof password === 'object') {
    //   // handle `db.crypto({ password, ...options })`
    //   options = password
    //   password = password.password
    //   delete options.password
    // }
    // setup ignore list
    db._ignore = IGNORE.concat(options.ignore || [])

    if(!cryptConfig || !cryptConfig.key || !cryptConfig.config){
      throw new Error("crypto configuration file is required")
    }

    // setup crypto helper
    const trySetup = async () => {
      // try saving credentials to a local doc
      try {
        // // first we try to get saved creds from the local doc
        // const localDb = await PouchdbCrypto.localIdb()
        // let exportString = await localDb.get('crypto',`encryption_data_${db.name}`)
        // if(!exportString){
        //   // no existing encryption key found
        //
        //   // do first-time setup
        //   db._crypt = new Crypt(password)
        //   let exportString = await db._crypt.export()
        //   await localDb.put('crypto', exportString, `encryption_data_${db.name}`)
        // } else {
        //
        // }

        db._crypt = await Crypt.import(cryptConfig.key, cryptConfig.config)

      } catch (err) {
        throw err
      }
    }
    await trySetup()
    // instrument document transforms
    db.transform({
      incoming: async (doc) => {
        // if no crypt, ex: after .removeCrypto(), just return the doc
        if (!db._crypt) {
          return doc
        }
        if (doc._attachments && !db._ignore.includes('_attachments')) {
          throw new Error('Attachments cannot be encrypted. Use {ignore: "_attachments"} option')
        }
        let encrypted: any = {}
        for (let key of db._ignore) {
          // attach ignored fields to encrypted doc
          if (key in doc) encrypted[key] = doc[key]
        }
        encrypted.payload = await db._crypt.encrypt(JSON.stringify(doc))
        return encrypted
      },
      outgoing: async (doc) => {
        return await this.decryptDocument(db, doc)
      }
    })
    return db
  }
  public static async decryptDocument(db, doc):Promise<any>{
    // if no crypt, ex: after .removeCrypto(), just return the doc
    if (!db._crypt) { return doc }
    let decryptedString = await db._crypt.decrypt(doc.payload)
    let decrypted = JSON.parse(decryptedString)
    for (let key of db._ignore) {
      // patch decrypted doc with ignored fields
      if (key in doc) decrypted[key] = doc[key]
    }
    return decrypted
  }

  public static removeCrypto(db) {
    delete db._crypt
  }
}
