export class PouchdbUpsert {
  public static upsert(db, docId, diffFun, cb?) {
    var promise = PouchdbUpsert.upsertInner(db, docId, diffFun);
    if (typeof cb !== 'function') {
      return promise;
    }
    promise.then(function(resp) {
      cb(null, resp);
    }, cb);
  };

  public static putIfNotExists(db, docId, doc, cb?) {
    if (typeof docId !== 'string') {
      cb = doc;
      doc = docId;
      docId = doc._id;
    }

    var diffFun = function(existingDoc) {
      if (existingDoc._rev) {
        return false; // do nothing
      }
      return doc;
    };

    var promise = PouchdbUpsert.upsertInner(db, docId, diffFun);
    if (typeof cb !== 'function') {
      return promise;
    }
    promise.then(function(resp) {
      cb(null, resp);
    }, cb);
  };

  ///////////////////////////////////////////////////////////////////////////////////////
  // private methods
  ///////////////////////////////////////////////////////////////////////////////////////
  // this is essentially the "update sugar" function from daleharvey/pouchdb#1388
  // the diffFun tells us what delta to apply to the doc.  it either returns
  // the doc, or false if it doesn't need to do an update after all
  private static upsertInner(db, docId, diffFun) {
    if (typeof docId !== 'string') {
      return Promise.reject(new Error('doc id is required'));
    }

    return db.get(docId).catch(function (err) {
      /* istanbul ignore next */
      if (err.status !== 404) {
        throw err;
      }
      return {};
    }).then(function (doc) {
      // the user might change the _rev, so save it for posterity
      var docRev = doc._rev;
      var newDoc = diffFun(doc);

      if (!newDoc) {
        // if the diffFun returns falsy, we short-circuit as
        // an optimization
        return { updated: false, rev: docRev, id: docId };
      }

      // users aren't allowed to modify these values,
      // so reset them here
      newDoc._id = docId;
      newDoc._rev = docRev;
      return PouchdbUpsert.tryAndPut(db, newDoc, diffFun);
    });
  }

  private static tryAndPut(db, doc, diffFun) {
    return db.put(doc).then((res) => {
      return {
        updated: true,
        rev: res.rev,
        id: doc._id
      };
    }, (err) => {
      /* istanbul ignore next */
      if (err.status !== 409) {
        throw err;
      }
      return this.upsertInner(db, doc._id, diffFun);
    });
  }
}
