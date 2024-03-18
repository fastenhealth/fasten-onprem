import { Factory } from 'fishery';

class ObservationR4Factory extends Factory<{}> {

  valueString(value?: string) {
    return this.params({
      valueQuantity: null,
      valueString: value || '5.5mmol/l'
    })
  }

  valueQuantity(params: {}) {
    return this.params({
      valueQuantity: {
        value: params['value'] || 6.3,
        unit: params['unit'] || 'mmol/l',
        system: 'http://unitsofmeasure.org',
        code: params['code'] || 'mmol/L',
        comparator: params['comparator']
      }
    })
  }

  referenceRange(high?: number, low?: number) {
    return this.params({
      referenceRange: [
        {
          low: {
            value: low || 3.1,
            unit: 'mmol/l',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          },
          high: {
            value: high || 6.5,
            unit: 'mmol/l',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          }
        }
      ]
    })
  }

  referenceRangeOnlyHigh(value?: number) {
    return this.params({
      referenceRange: [
        {
          high: {
            value: value || 6.5,
            unit: 'mmol/l',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          }
        }
      ]
    });
  };

  referenceRangeOnlyLow(value?: number) {
    return this.params({
      referenceRange: [
        {
          low: {
            value: value || 3.1,
            unit: 'mmol/l',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          }
        }
      ]
    });
  };

  referenceRangeString(range?: string) {
    return this.params({
      referenceRange: [
        {
          text: range || '3.1mmol/l-6.3mmol/l'
        }
      ]
    });
  };

  referenceRangeStringOnlyHigh(high?: string) {
    return this.params({
      referenceRange: [
        {
          text: high || '<=5.5'
        }
      ]
    });
  };

  referenceRangeStringOnlyLow(low?: | string) {
    return this.params({
      referenceRange: [
        {
          text: low || '>=4.5'
        }
      ]
    });
  };
}

export const observationR4Factory = ObservationR4Factory.define(() => (
  {
    resourceType: 'Observation',
    id: 'f001',
    text: {
      status: 'generated',
      div: "<div xmlns=\'http://www.w3.org/1999/xhtml\'><p><b>Generated Narrative with Details</b></p><p><b>id</b>: example</p><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span>(Details : {http://terminology.hl7.org/CodeSystem/observation-category code 'vital-signs' = 'Vital Signs', given as 'Vital Signs'})</span></p><p><b>code</b>: Body Weight <span>(Details : {LOINC code '29463-7' = 'Body weight', given as 'Body Weight'}; {LOINC code '3141-9' = 'Body weight Measured', given as 'Body weight Measured'}; {SNOMED CT code '27113001' = 'Body weight', given as 'Body weight'}; {http://acme.org/devices/clinical-codes code 'body-weight' = 'body-weight', given as 'Body Weight'})</span></p><p><b>subject</b>: <a>Patient/example</a></p><p><b>encounter</b>: <a>Encounter/example</a></p><p><b>effective</b>: 28/03/2016</p><p><b>value</b>: 185 lbs<span> (Details: UCUM code [lb_av] = 'lb_av')</span></p></div>"
    },
    identifier: [
      {
        use: 'official',
        system: 'http://www.bmc.nl/zorgportal/identifiers/observations',
        value: '6323'
      }
    ],
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '15074-8',
          display: 'Glucose [Moles/volume] in Blood'
        }
      ]
    },
    subject: {
      reference: 'Patient/f001',
      display: 'P. van de Heuvel'
    },
    effectiveDateTime: '2016-03-28',
    effectivePeriod: {
      start: '2013-04-02T09:30:10+01:00'
    },
    issued: '2013-04-03T15:30:10+01:00',
    performer: [
      {
        reference: 'Practitioner/f005',
        display: 'A. Langeveld'
      }
    ],
    valueQuantity: {
      value: 6.3,
      unit: 'mmol/l',
      system: 'http://unitsofmeasure.org',
      code: 'mmol/L'
    },
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'H',
            display: 'High'
          }
        ]
      }
    ],
  }
));
