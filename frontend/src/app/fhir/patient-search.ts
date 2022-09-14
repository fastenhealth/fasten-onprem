// import moment from "moment"
// import { CODE_SYSTEMS } from "./constants"
// import { intVal, getPath, parseQueryString, request } from "./utils"
//
// /**
//  * This is just a helper class that is used as a query builder. It has some
//  * dedicated setter methods for various query parameters and knows how to
//  * compile those into a query string that can be passed to the Patient endpoint
//  * of a fhir api server.
//  */
// export default class PatientSearch
// {
//   /**
//    * The constructor just creates an empty instance. Use the setter methods
//    * to set query params and then call compile to build the query string.
//    */
//   constructor(options = {}) {
//
//     this.__cache__ = {};
//
//     this.__scheduled__ = {};
//
//     /**
//      * The list of conditions that should be included in the query.
//      * @type {Object} A map of unique keys and condition objects
//      * @private
//      */
//     this.conditions = { ...(options.conditions || {}) };
//
//     /**
//      * The desired minimal age of the patients as an object like
//      * { value: 5, units: "years" }
//      * @type {Object}
//      * @private
//      */
//     this.minAge = null;
//
//     /**
//      * The desired maximal age of the patients as an object like
//      * { value: 5, units: "years" }
//      * @type {Object}
//      * @private
//      */
//     this.maxAge = null;
//
//     /**
//      * The patient gender to search for (male|female)
//      * @type {String}
//      * @private
//      */
//     this.gender = options.gender || null;
//
//     /**
//      * How many patients to fetch per page. Defaults to null meaning that
//      * this param will not be included in the query and we are leaving it
//      * for the server to decide.
//      * @type {Number}
//      * @private
//      */
//     this.limit = options.limit || null;
//
//     /**
//      * How many patients to skip. Defaults to null meaning that
//      * this param will not be included in the query and we are leaving it
//      * for the server to decide.
//      * @type {Number}
//      * @private
//      */
//     this.offset = null;
//
//     /**
//      * A collection of additional parameters
//      * @type {Object}
//      * @private
//      */
//     this.params = {};
//
//     /**
//      * This is like a flag that toggle the instance to different modes
//      * (currently only advanced and default are supported)
//      * @type {String} "advanced" or "default"
//      * @private
//      */
//     this.queryType = options.queryType || "default";
//
//     /**
//      * The query string to use if in advanced mode
//      * @type {String}
//      * @private
//      */
//     this.queryString = options.queryString || "";
//
//     /**
//      * The sort parameters list
//      * @type {String}
//      * @private
//      */
//     this.sort = options.sort || "";
//
//     /**
//      * All the tags that the patients should be filtered by
//      * @type {Array<String>}
//      * @private
//      */
//     this.tags = String(options.tags || "").split(/\s*,\s*/).filter(Boolean);
//   }
//
//   /**
//    * Schedule a prop change to be made before the next compile
//    * @param {Object} props
//    */
//   schedule(props) {
//     this.__scheduled__ = { ...this.__scheduled__, ...props };
//   }
//
//   hasParam(name) {
//     return this.params.hasOwnProperty(name);
//   }
//
//   /**
//    * Sets a param by name. Note that this is a lower level interface. It does
//    * not know anything about the parameter thus it will not handle UI
//    * dependencies (eg. it won't reset the offset for you)
//    * @param {Name} name The name of the parameter to set
//    * @param {*} value The value to set. Use undefined to remove a parameter
//    * @returns {PatientSearch} Returns the instance
//    */
//   setParam(name, value) {
//     let has = this.hasParam(name)
//     if (value === undefined) {
//       if (has) {
//         delete this.params[name]
//       }
//     }
//     else {
//       this.params[name] = value
//     }
//     this.offset  = null;
//     this.cacheId = null;
//     return this
//   }
//
//   /**
//    * Sets the query type. In advanced mode a query string is provided and
//    * parsed and all the other parameters are ignored. In default mode the
//    * query string is ignored and only the other params are used.
//    * @param {String} type "advanced" or anything else for "default"
//    * @returns {PatientSearch} Returns the instance
//    */
//   setQueryType(type) {
//     this.queryType = type == "advanced" ? "advanced" : "default"
//     return this
//   }
//
//   /**
//    * Sets the query string to be used while in advanced mode. Note that this
//    * will not be used if not in advanced mode but the query string will still
//    * be persisted so that if the user switches the UI to advanced the last
//    * query can be displayed...
//    * @param {String} query The query string to use if in advanced mode
//    * @returns {PatientSearch} Returns the instance
//    */
//   setQueryString(query) {
//     this.queryString = String(query || "")
//     return this
//   }
//
//   /**
//    * Adds a condition to the list of patient conditions
//    * @param {String} key Unique string identifier for that condition
//    * @param {Object} condition The condition to add
//    * @returns {PatientSearch} Returns the instance
//    */
//   addCondition(key, condition) {
//     this.conditions[key] = condition;
//     this.__cache__.patientIDs = null;
//     return this;
//   }
//
//   /**
//    * Removes the condition identified by it's key. If that condition is not
//    * currently included it does nothing
//    * @param {*} key Unique string identifier for that condition
//    * @returns {PatientSearch} Returns the instance
//    */
//   removeCondition(key) {
//     if (this.conditions.hasOwnProperty(key)) {
//       delete this.conditions[key];
//       this.__cache__.patientIDs = null;
//     }
//     return this;
//   }
//
//   /**
//    * Replaces the entire set of conditions at once
//    * @param {Object} conditions The new conditions to set
//    * @returns {PatientSearch} Returns the instance
//    */
//   setConditions(conditions) {
//     this.conditions = { ...conditions };
//     this.schedule({
//       offset: null,
//       cacheId: null
//     });
//     this.__cache__.patientIDs = null;
//     return this;
//   }
//
//   addTag(tag) {
//     if (this.tags.findIndex(tag) == -1) {
//       this.tags.push(tag);
//     }
//     return this;
//   }
//
//   removeTag(tag) {
//     let index = this.tags.findIndex(tag);
//     if (index > -1) {
//       this.tags.splice(index, 1);
//     }
//     return this;
//   }
//
//   setTags(tags) {
//     this.tags = [ ...tags ]
//     this.schedule({
//       offset: null,
//       cacheId: null
//     });
//     return this;
//   }
//
//   /**
//    * Sets the desired min age af the patients. This can also be set to null
//    * (or other falsy value) to exclude the minAge restrictions from the query.
//    * @param {object} age The age
//    * @param {number} age.value The age as number of units
//    * @param {string} age.units The units for the value (years|months|days)
//    * @returns {PatientSearch} Returns the instance
//    */
//   setMinAge(age) {
//     this.minAge  = age;
//     this.schedule({
//       offset: null,
//       cacheId: null
//     });
//     return this;
//   }
//
//   /**
//    * Sets the desired max age af the patients. This can also be set to null
//    * (or other falsy value) to exclude the maxAge restrictions from the query.
//    * @param {object} age The age
//    * @param {number} age.value The age as number of units
//    * @param {string} age.units The units for the value (years|months|days)
//    * @returns {PatientSearch} Returns the instance
//    */
//   setMaxAge(age) {
//     this.maxAge  = age;
//     this.schedule({
//       offset: null,
//       cacheId: null
//     });
//     return this;
//   }
//
//   /**
//    * Sets the min and max ages depending on the specified age group keyword
//    * @param {*} group Can be one of infant, child, adult, elderly.
//    *                  Anything else will clear the age constraints!
//    * @returns {PatientSearch} Returns the instance
//    */
//   setAgeGroup(group) {
//     this.ageGroup = group;
//     this.schedule({
//       offset: null,
//       cacheId: null
//     });
//
//     switch (group) {
//
//       // infant - 0 to 12 months
//       case "infant":
//         this.setMinAge(null);
//         this.setMaxAge({ value: 1, units: "years" });
//         break;
//
//       // child - 1 to 18 years
//       case "child":
//         this.setMinAge({ value: 1 , units: "years" });
//         this.setMaxAge({ value: 18, units: "years" });
//         break;
//
//       // adult - 18 to 65 years
//       case "adult":
//         this.setMinAge({ value: 18, units: "years" });
//         this.setMaxAge({ value: 65, units: "years" });
//         break;
//
//       // Elderly - 65+
//       case "elderly":
//         this.setMinAge({ value: 65, units: "years" });
//         this.setMaxAge(null);
//         break;
//
//       // Anything else clears the birthdate param
//       default:
//         this.setMinAge(null);
//         this.setMaxAge(null);
//         // this.ageGroup = null;
//         break;
//     }
//     return this;
//   }
//
//   /**
//    * Sets the gender to search for. Can be "male" or "female". Any falsy value
//    * will clear the gender param
//    * @param {String} gender "male" or "female"
//    * @returns {PatientSearch} Returns the instance
//    */
//   setGender(gender) {
//     if (gender !== this.gender) {
//       this.gender  = gender;
//       this.schedule({
//         offset : null,
//         cacheId: null
//       });
//     }
//     return this;
//   }
//
//   /**
//    * Sets how many patients will be fetched per page
//    * @param {number|string} limit The number of records to fetch
//    * @returns {PatientSearch} Returns the instance
//    */
//   setLimit(limit) {
//     this.limit = intVal(limit)
//     if (this.limit < 1) {
//       this.limit = null;
//     }
//     return this;
//   }
//
//   /**
//    * Sets how many patients will be skipped
//    * @param {string} cacheId The id generated by the server (_getpages)
//    * @param {number|string} offset The number of records to skip
//    * @returns {PatientSearch} Returns the instance
//    */
//   setOffset(cacheId, offset) {
//     this.offset = intVal(offset)
//     this.cacheId = cacheId
//     if (this.offset < 1) {
//       this.offset = null;
//       this.cacheId = null;
//     }
//     return this;
//   }
//
//   /**
//    * Sets the sorting to use
//    * @param {string} sort A fhir sort string like "status,-date,category"
//    * @returns {PatientSearch} Returns the instance
//    */
//   setSort(sort) {
//     this.sort = sort;
//     this.offset = null;
//     this.cacheId = null;
//     return this
//   }
//
//   /**
//    * Returns another PatientSearch instance with the exact same state as this.
//    * @returns {PatientSearch} Returns the new copy
//    */
//   clone() {
//     let inst = new PatientSearch();
//
//     inst.conditions = { ...this.conditions };
//     inst.params = { ...this.params };
//     inst.tags = [ ...this.tags ];
//
//     inst.setSort(this.sort)
//       .setAgeGroup(this.ageGroup)
//       .setMinAge(this.minAge)
//       .setMaxAge(this.maxAge)
//       .setGender(this.gender)
//       .setLimit(this.limit)
//       .setOffset(this.cacheId, this.offset)
//       .setQueryType(this.queryType)
//       .setQueryString(this.queryString);
//
//     return inst;
//   }
//
//   /**
//    * Clear all params. If you call compile after clear only the "_format=json"
//    * part should be returned
//    * @returns {PatientSearch} Returns the instance
//    */
//   reset() {
//     this.conditions   = {};
//     this.minAge       = null;
//     this.maxAge       = null;
//     this.gender       = null;
//     this.limit        = null;
//     this.offset       = null;
//     this.cacheId      = null;
//     this.ageGroup     = null;
//     this.params       = {};
//     this.queryString  = "";
//     this.queryType    = "default"
//     this.sort         = "";
//     this.tags         = [];
//     return this;
//   }
//
//   /**
//    * Returns an object representing the current state of the instance.
//    * The object contains COPIES of the current param values.
//    * @returns {Object}
//    */
//   getState() {
//     return {
//       conditions  : this.conditions,
//       minAge      : this.minAge,
//       maxAge      : this.maxAge,
//       gender      : this.gender,
//       limit       : this.limit,
//       offset      : this.offset,
//       cacheId     : this.cacheId,
//       ageGroup    : this.ageGroup,
//       params      : { ...this.params },
//       queryString : this.queryString,
//       queryType   : this.queryType,
//       sort        : this.sort,
//       tags        : [ ...this.tags ]
//     };
//   }
//
//   /**
//    * Compiles and returns the query string that can be send to the Patient
//    * endpoint.
//    * @return {String} The compiled query string (without the "?" in front)
//    */
//   compile(encode=true) {
//     let params = [];
//
//     [
//       // conditions
//       "minAge",
//       "maxAge",
//       "gender",
//       "limit",
//       "offset",
//       // "params",
//       "queryType",
//       "queryString",
//       "sort"//,
//       // tags
//     ].forEach(prop => {
//       if (this.__scheduled__.hasOwnProperty(prop)) {
//         this[prop] = this.__scheduled__[prop];
//         delete this.__scheduled__[prop];
//       }
//     })
//
//     // Tags ----------------------------------------------------------------
//     if (this.tags.length && !this.params._id) {
//       params.push({ name: "_tag", value: this.tags.join(",") });
//     }
//
//     // Advanced query ------------------------------------------------------
//     if (this.queryType == "advanced") {
//       let str = this.queryString.trim()
//       if (str) {
//         let _query = parseQueryString(str);
//         for (let name in _query) {
//           params.push({ name, value: _query[name] });
//         }
//       }
//     }
//
//     // Default query -------------------------------------------------------
//     else {
//
//       // Custom params ---------------------------------------------------
//       Object.keys(this.params).forEach(k => {
//         if (String(this.params[k]).trim()) {
//           params.push({
//             name : k,
//             value: this.params[k]
//           });
//         }
//       });
//
//       // sort ------------------------------------------------------------
//       if (this.sort) {
//         String(this.sort).split(",").forEach(token => {
//           if (token.indexOf("-") === 0) {
//             params.push({
//               name : "_sort:desc",
//               value: token.substring(1)
//             })
//           }
//           else {
//             params.push({
//               name : "_sort:asc",
//               value: token
//             })
//           }
//         })
//         // params.push({
//         //     name : "_sort",
//         //     value: this.sort
//         // })
//       }
//
//       if (!this.params._id) {
//
//         // Min age -----------------------------------------------------
//         if (this.minAge) {
//           let d = moment().subtract(
//             this.minAge.value,
//             this.minAge.units
//           );
//           params.push({
//             name : "birthdate",
//             value: "le" + d.format('YYYY-MM-DD')
//           });
//         }
//
//         // Max age -----------------------------------------------------
//         if (this.maxAge) {
//           let d = moment().subtract(
//             this.maxAge.value,
//             this.maxAge.units
//           );
//           params.push({
//             name : "birthdate",
//             value: "ge" + d.format('YYYY-MM-DD')
//           });
//         }
//
//         // exclude deceased patients if age is specified ---------------
//         if (this.maxAge || this.minAge) {
//           let existing = params.find(p => p.name === "deceased");
//           if (existing) {
//             existing.value = false;
//           }
//           else {
//             params.push({
//               name : "deceased",
//               value: false
//             });
//           }
//         }
//
//         // Gender ------------------------------------------------------
//         if (this.gender) {
//           params.push({
//             name : "gender",
//             value: this.gender
//           });
//         }
//       }
//     }
//
//     // limit ---------------------------------------------------------------
//     if (this.limit) {
//       params.push({
//         name : "_count",
//         value: this.limit
//       });
//     }
//
//     // offset --------------------------------------------------------------
//     if (this.offset && this.cacheId) {
//       params.push({
//         name: "_getpages",
//         value: this.cacheId
//       }, {
//         name : "_getpagesoffset",
//         value: this.offset
//       });
//     }
//
//     // Compile and return --------------------------------------------------
//     return params.map(p => (
//       encode ?
//         encodeURIComponent(p.name) + "=" + encodeURIComponent(p.value) :
//         p.name + "=" + p.value
//     )).join("&");
//   }
//
//   /**
//    * Checks if there are any conditions chosen at the moment
//    * @returns {Boolean}
//    */
//   hasConditions() {
//     for (let key in this.conditions) {
//       if (this.conditions.hasOwnProperty(key)) {
//         return true;
//       }
//     }
//     return false;
//   }
//
//   /**
//    * Compiles the current conditions into URL-encoded parameter list
//    * @returns {String}
//    */
//   compileConditions() {
//     // let params = [];
//
//     // for (let key in this.conditions) {
//     //     let condition = this.conditions[key]
//
//     //     // system
//     //     let value = [];
//     //     for (let system in condition.codes) {
//     //         let systemUrl = (CODE_SYSTEMS[system] || {}).url;
//
//     //         // system.code[n] - OR
//     //         condition.codes[system].forEach(c => {
//     //             value.push( systemUrl ? systemUrl + "|" + c : c );
//     //         })
//     //     }
//
//     //     if (value.length) {
//     //         params.push({
//     //             name : "code",
//     //             value: value.join(",")
//     //         })
//     //     }
//     // }
//
//     // return params.map(p => (
//     //     encodeURIComponent(p.name) + "=" + encodeURIComponent(p.value)
//     // )).join("&");
//     let out = []
//     for (let key in this.conditions) {
//       let condition = this.conditions[key]
//
//       // system
//       let value = [];
//       for (let system in condition.codes) {
//         let systemUrl = (CODE_SYSTEMS[system] || {}).url || "http://snomed.info/sct";
//
//         // system.code[n] - OR
//         condition.codes[system].forEach(c => {
//           value.push(systemUrl + "|" + c);
//         })
//       }
//
//       if (value.length) {
//         out.push(value.join(","));
//       }
//     }
//     return out.length ? "code=" + encodeURIComponent(out.join(",")) : "";
//   }
//
//   getConditionKeys() {
//     let out = []
//     for (let key in this.conditions) {
//       let condition = this.conditions[key]
//
//       // system
//       let value = [];
//       for (let system in condition.codes) {
//         let systemUrl = (CODE_SYSTEMS[system] || {}).url || "http://snomed.info/sct";
//
//         // system.code[n] - OR
//         condition.codes[system].forEach(c => {
//           value.push(systemUrl + "|" + c);
//         })
//       }
//
//       if (value.length) {
//         out.push(value.join(","));
//       }
//     }
//     return out;
//   }
//
//   /**
//    * Returns a promise resolved with a list of patient IDs that have the
//    * specified condition(s)
//    * @param {String} baseURL
//    * @returns {Promise<String[]>}
//    */
//   getPatientIDs(server) {
//
//     if (this.__cache__.patientIDs) {
//       return Promise.resolve(this.__cache__.patientIDs);
//     }
//
//     let conditions = this.compileConditions();
//
//     if (!conditions) {
//       return Promise.resolve([]);
//     }
//
//     /**
//      * The keys (eg: "http://snomed.info/sct|44054006") that were set by the
//      * user.
//      * @type {Array<String>}
//      * @private
//      */
//     let conditionKeys = this.getConditionKeys();
//
//     /**
//      * Map of patient IDs as keys and array of condition keys as values.
//      * @private
//      */
//     let patientIDs = {};
//
//     /**
//      * Handles the JSON response (single page) of the conditions query.
//      * Collects the patient IDs and their condition codes into the
//      * patientIDs local variable. When all the pages are fetched, cleans up
//      * the IDs to only contain those that have all the conditions specified
//      * by the user.
//      * @param {Object} response The JSON Conditions bundle response
//      * @returns {Promise<any>} Array of patient ID strings (can be empty)
//      */
//     const handleConditionsResponse = response => {
//
//       // Collect the data
//       if (response.entry) {
//         response.entry.forEach(condition => {
//           let patientID = server.type == "DSTU-2" ?
//             condition.resource.patient.reference.split("/").pop():
//             condition.resource.subject.reference.split("/").pop();
//           if (!patientIDs[patientID]) {
//             patientIDs[patientID] = [];
//           }
//           patientIDs[patientID].push(
//             (getPath(condition, "resource.code.coding.0.system") || "http://snomed.info/sct")
//             + "|" + getPath(condition, "resource.code.coding.0.code")
//           );
//         });
//
//         let nextLink = (response.link || []).find(l => l.relation == "next");
//         if (nextLink) {
//           return request({ url: nextLink.url }).then(handleConditionsResponse);
//         }
//       }
//       // console.log(conditionKeys, patientIDs)
//       // Clean up and only leave patients having all the conditions
//       patientIDs = Object.keys(patientIDs).filter(key => {
//         return conditionKeys.every(
//           conditionKey => patientIDs[key].indexOf(conditionKey) > -1
//         );
//       });
//       // console.log(patientIDs)
//
//       // finally return a promise resolved with the compiled ID array
//       return Promise.resolve(patientIDs);
//     }
//
//     // The conditions to search for
//     let params = [conditions];
//
//     // only need the patient - skip the rest to reduce the response
//     params.push(
//       server.type == "DSTU-2" ?
//         "_elements=patient,code" :
//         "_elements=subject,code"
//     );
//
//     // Set bigger limit here to reduce the chance of having to
//     // make other queries to fetch subsequent pages
//     params.push("_count=500");
//
//     // Tags (not currently available in STU2)
//     if (this.tags.length) {
//       params.push( "_tag=" + encodeURIComponent(this.tags.join(",")) );
//     }
//
//     return request({
//       url: `${server.url}/Condition?${params.join("&")}`
//     })
//       .then(handleConditionsResponse)
//       .then(ids => {
//         this.__cache__.patientIDs = ids;
//         return ids;
//       });
//   }
//
//   /**
//    * Fetches the patients matching the user-defined conditions. The actual
//    * strategy may vary but regardless of the implementation, a promise is
//    * returned that should eventually be resolved with the result bundle.
//    * @param {String} baseURL
//    * @returns {Promise<Bundle>}
//    */
//   fetch(server) {
//
//     let data = this.compile()
//
//     // STU2 does not work with the deceased param
//     if (server.type == "DSTU-2") {
//       data = data.replace(/\bdeceased=(true|false)\b/gi, "");
//     }
//
//     // prepare the base options for the patient ajax request
//     let options = {
//       url: this.offset && this.cacheId ? server.url : `${server.url}/Patient/_search`,
//       method: this.offset && this.cacheId ? "GET" : "POST",
//       processData: false,
//       data,
//       headers: {
//         accept: "application/json+fhir",
//         "content-type": "application/x-www-form-urlencoded"
//       }
//     };
//
//     return this.getPatientIDs(server)
//       .then(ids => {
//         if (ids.length) {
//           // if IDs were found - add them to the patient query
//           options.data = [
//             options.data,
//             "_id=" + encodeURIComponent(ids.join(","))
//           ].filter(Boolean).join("&");
//         }
//         else {
//           // If conditions were specified but no patients were found to
//           // have those conditions, then we should exit early.
//           if (this.hasConditions()) {
//             return Promise.reject(
//               "No patients found with the specified conditions!"
//             );
//           }
//         }
//         return options;
//       })
//       .then(request);
//   }
// }
