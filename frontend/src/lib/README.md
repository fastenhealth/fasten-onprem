# lib

This directory contains Typescript libraries/packages that are intended to be used in both Angular & WebWorkers (and potentially NodeJS).
That means they cannot contain any browser context/DOM specific code, as they will break in Web Workers. 

## conduit

Conduit is a library that can retrieve data from various Medical Providers, transform it, and
store it in the database. This code will eventually be moved into its own repository.

There are multiple protocols used by the Medical Provider industry to transfer patient data, the following mechanisms are the
ones that Fasten supports

- FHIR R4
- FHIR R3

## database

the database library is (currently) wrapper around PouchDB, with code allowing it to sync with an external/hosted CouchDB instance. 
