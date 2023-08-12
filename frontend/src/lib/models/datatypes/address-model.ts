import * as fhirpath from 'fhirpath';

export class AddressModel {
  city: string
  line: string[]
  state: string
  country: string
  postalCode: string


  constructor(fhirData: any) {
    if(!fhirData){
      return
    }
    this.city = fhirpath.evaluate(fhirData, "city").join("")
    this.line = fhirpath.evaluate(fhirData, "line")
    this.state = fhirpath.evaluate(fhirData, "state").join("")
    this.country = fhirpath.evaluate(fhirData, "country").join("")
    this.postalCode = fhirpath.evaluate(fhirData, "postalCode").join("")
  }
}
