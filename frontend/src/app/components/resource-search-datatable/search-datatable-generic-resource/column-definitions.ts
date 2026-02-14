import { Component } from '@angular/core';
import {
  attributeXTime,
  obsValue,
} from '../../fhir-datatable/datatable-generic-resource/utils';
import { SearchDatatableGenericResourceComponent } from './search-datatable-generic-resource.component';

class GenericColumnDefn {
  title: string;
  prop?: string;
  versions?: string;
  format?: string;
  getter: Function;
  defaultValue?: string;
}

@Component({
  selector: 'search-datatable-fallback',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableFallbackComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Id', versions: '*', getter: (e) => e.id },
    { title: 'Title', versions: '*', getter: (e) => e.reasonCode?.[0] || e.code?.text || '-' },
  ];
}

@Component({
  selector: 'search-datatable-goal',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableGoalComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Description', versions: '*', getter: (e) => e.description.text },
    { title: 'Status', versions: '*', getter: (e) => e.lifecycleStatus },
    { title: 'Status Reason', versions: '*', getter: (e) => e.statusReason },
  ];
}

@Component({
  selector: 'search-datatable-adverse',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableAdverseEventComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Event',
      versions: '*',
      format: 'codeableConcept',
      getter: (a) => a.event,
    },
    { title: 'Date', versions: '*', format: 'date', getter: (a) => a.date },
  ];
}

@Component({
  selector: 'search-datatable-allergy-intolerance',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableAllergyIntoleranceComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Date Recorded',
      versions: '*',
      format: 'date',
      getter: (a) => a.assertedDate || a.recordedDate,
    },
    { title: 'Allergy Type', versions: '*', getter: (a) => a.category[0] }, // Allergy Type
    {
      title: 'Allergic To',
      versions: '*',
      format: 'codeableConcept',
      getter: (a) => a.code,
    }, // Substance
    {
      title: 'Reaction',
      versions: '*',
      getter: (a) => a.reaction[0].manifestation[0].text,
    }, // Reaction
    {
      title: 'Onset',
      versions: '*',
      format: 'date',
      getter: (a) => a.onsetDateTime,
    },
    {
      title: 'Resolution Age',
      versions: '*',
      format: 'date',
      getter: (a) => a.extension.resolutionAge,
    },
  ];
}

@Component({
  selector: 'search-datatable-binary',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableBinaryComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Content-Type', versions: '*', getter: (c) => c.contentType },
    { title: 'ID', versions: '*', getter: (c) => c.id },
    {
      title: 'Last Updated',
      versions: '*',
      getter: (c) => c.meta?.lastUpdated,
    },
    {
      title: 'Size',
      versions: '*',
      getter: (c) => Math.floor((c.data?.length * 4 + 2) / 3),
    },
  ];
}

@Component({
  selector: 'search-datatable-care-plan',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableCarePlanComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Category',
      versions: '*',
      format: 'code',
      getter: (c) => c.category[0].coding[0],
    },
    {
      title: 'Reason',
      versions: '*',
      getter: (c) => {
        return (c.activity || []).map((a, i) => {
          let reason = a.detail?.code?.coding[0]?.display || '';
          return reason ? [reason, a.detail?.status || 'no data'] : [];
        });
      },
    },
    {
      title: 'Period',
      versions: '*',
      format: 'period',
      getter: (c) => c.period,
    },
    { title: 'Status', versions: '*', getter: (a) => a.status },
  ];
}

@Component({
  selector: 'search-datatable-care-team',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableCareTeamComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Category',
      versions: '*',
      format: 'codableConcept',
      getter: (c) => c.category[0],
    },
    { title: 'Name', versions: '*', getter: (c) => c.name },
    {
      title: 'Period',
      versions: '*',
      format: 'period',
      getter: (c) => c.period,
    },
    { title: 'Status', versions: '*', getter: (a) => a.status },
  ];
}

@Component({
  selector: 'search-datatable-communication',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableCommunicationComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Reason',
      versions: '*',
      format: 'code',
      getter: (c) => c.reasonCode[0].coding[0],
    },
    { title: 'Sent', versions: '*', format: 'date', getter: (c) => c.sent },
    {
      title: 'Received',
      versions: '*',
      format: 'date',
      getter: (c) => c.received,
    },
    { title: 'Status', versions: '*', getter: (c) => c.status },
  ];
}

@Component({
  selector: 'search-datatable-condition',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableConditionComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Condition',
      versions: '*',
      format: 'codeableConcept',
      getter: (c) => c.code,
    },
    {
      title: 'Date of Onset',
      versions: '*',
      format: 'date',
      getter: (c) => c.onsetDateTime,
    },
    {
      title: 'Date Resolved',
      versions: '*',
      format: 'date',
      getter: (c) => c.abatementDateTime,
      defaultValue: 'N/A',
    },
    {
      title: 'Recorded Date',
      versions: '*',
      format: 'date',
      getter: (c) => c.recordedDate,
    },
    {
      title: 'Severity',
      versions: '*',
      format: 'codeableConcept',
      getter: (c) => c.severity,
    },
    {
      title: 'Body Site',
      versions: '*',
      format: 'codeableConcept',
      getter: (c) => c.bodySite?.[0],
    },
  ];
}

@Component({
  selector: 'search-datatable-coverage',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableCoverageComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Type',
      versions: '*',
      format: 'codeableConcept',
      getter: (c) => c.type,
    },
    {
      title: 'Period',
      versions: '*',
      format: 'period',
      getter: (c) => c.period,
    },
  ];
}

@Component({
  selector: 'search-datatable-device-request',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableDeviceRequestComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Device',
      versions: '*',
      format: 'codeableConcept',
      getter: (d) => d.codeCodeableConcept,
    },
    {
      title: 'Author Date',
      versions: '*',
      format: 'date',
      getter: (d) => d.authoredOn,
    },
    {
      title: 'Do Not Perform',
      versions: '*',
      getter: (d) => d.modifierExtension.doNotPerform,
    },
    {
      title: 'Do Not Perform Reason',
      versions: '*',
      format: 'codeableConcept',
      getter: (s) => s.extension?.doNotPerformReason,
    },
  ];
}

@Component({
  selector: 'search-datatable-device',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableDeviceComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Device',
      versions: '*',
      getter: (d) =>
        d.deviceName?.[0]?.name || d.type?.coding?.[0]?.display || d.type?.text,
    },
    { title: 'Manufacturer', versions: '*', getter: (d) => d.manufacturer },
    { title: 'Model', versions: '*', getter: (d) => d.modelNumber },
    {
      title: 'Type',
      versions: '*',
      format: 'codeableConcept',
      getter: (d) => d.type,
    },
    {
      title: 'Unique ID',
      versions: '*',
      getter: (d) => d.udi?.name || d.udiCarrier?.deviceIdentifier,
    },
  ];
}

@Component({
  selector: 'search-datatable-diagnostic-report',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableDiagnosticReportComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Issued', versions: '*', format: 'date', getter: (d) => d.issued },
    {
      title: 'Title',
      versions: '*',
      format: 'codeableConcept',
      getter: (d) => d.code,
    },
    {
      title: 'Document Title',
      versions: '*',
      getter: (d) => d.presentedForm?.[0]?.title,
    }, //Doc title
    {
      title: 'Author',
      versions: '*',
      getter: (d) => d.performer?.[0]?.display,
    },
  ];
}

@Component({
  selector: 'search-datatable-document-reference',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableDocumentReferenceComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Date', versions: '*', format: 'date', getter: (d) => d.date },
    {
      title: 'Content',
      versions: '*',
      getter: (d) => d.content?.[0]?.attachment.title,
    },
    {
      title: 'Category',
      versions: '*',
      format: 'codeableConcept',
      getter: (d) => d.type,
    }, // Document category - This is more accurate. Previous mostly shows "unknown".
    { title: 'Author', versions: '*', getter: (d) => d.author?.[0]?.display }, // Whoever creates the document
  ];
}

@Component({
  selector: 'search-datatable-encounter',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableEncounterComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Period',
      versions: '*',
      format: 'period',
      getter: (e) => e.period,
    },
    {
      title: 'Encounter',
      versions: '*',
      format: 'codeableConcept',
      getter: (e) => e.type?.[0],
    },
    {
      title: 'Reason',
      versions: '*',
      format: 'codeableConcept',
      getter: (e) => e.reasonCode?.[0],
    },
    {
      title: 'Practitioner',
      versions: '*',
      getter: (e) => e.participant?.[0]?.individual?.display,
    },
    {
      title: 'Discharge Disposition',
      versions: '*',
      format: 'codeableConcept',
      getter: (e) => e.hospitalization?.dischargeDisposition,
    },
  ];
}

@Component({
  selector: 'search-datatable-explanation-of-benefit',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableExplanationOfBenefitComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [];
}

@Component({
  selector: 'search-datatable-immunization',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableImmunizationComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Vaccine',
      versions: '*',
      format: 'codeableConcept',
      getter: (i) => i.vaccineCode,
    },
    { title: 'Status', versions: '*', getter: (i) => i.status },
    {
      title: 'Date Given',
      versions: '*',
      format: 'date',
      getter: (i) => i.date || i.occurrenceDateTime || i.occurrenceStringe,
    },
    {
      title: 'Date Recorded',
      versions: '*',
      format: 'date',
      getter: (i) => i.recorded,
    },
  ];
}

@Component({
  selector: 'search-datatable-immunization',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableAppointmentComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Type',
      versions: '*',
      format: 'codeableConcept',
      getter: (a) => a.serviceType,
    },
    { title: 'Status', versions: '*', getter: (a) => a.status },
    {
      title: 'Reason',
      versions: '*',
      format: 'code',
      getter: (a) => a.reason?.coding?.[0],
    },
    { title: 'Description', versions: '*', getter: (a) => a.description },
  ];
}

@Component({
  selector: 'search-datatable-location',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableLocationComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', getter: (d) => d.name || d.alias },
    {
      title: 'Organization',
      versions: '*',
      getter: (d) => d.managingOrganization?.display,
    },
    {
      title: 'Type',
      versions: '*',
      format: 'codeableConcept',
      getter: (d) => d.physicalType,
    },
    {
      title: 'Address',
      versions: '*',
      format: 'address',
      getter: (d) => d.address,
    },
  ];
}

@Component({
  selector: 'search-datatable-medication-administration',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableMedicationAdministrationComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Medication',
      versions: '*',
      format: 'codeableConcept',
      getter: (m) => m.medicationCodeableConcept,
    },
    {
      title: 'Route',
      versions: '*',
      format: 'codeableConcept',
      getter: (m) => m.dosage.route,
    },
    {
      title: 'Effective',
      versions: '*',
      getter: (m) => attributeXTime(m, 'effective'),
    },
    { title: 'Status', versions: '*', getter: (m) => m.status },
    {
      title: 'Status Reason',
      versions: '*',
      format: 'codeableConcept',
      getter: (m) => m.statusReason?.[0],
    },
    {
      title: 'Recorded',
      versions: '*',
      format: 'date',
      getter: (m) => m.extension.recorded,
    },
  ];
}

@Component({
  selector: 'search-datatable-medication-dispense',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableMedicationDispenseComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Medication',
      versions: '*',
      format: 'code',
      getter: (m) => m.medicationCodeableConcept?.coding?.[0],
    },
    {
      title: 'Handed Over Date',
      versions: '*',
      format: 'date',
      getter: (m) => m.whenHandedOver,
    },
  ];
}

@Component({
  selector: 'search-datatable-medication-request',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableMedicationRequestComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Author Date',
      versions: '*',
      format: 'date',
      getter: (m) => m.authoredOn,
    },
    {
      title: 'Medication',
      versions: '*',
      format: 'codeableConcept',
      getter: (m) => m.medicationCodeableConcept,
    },
    {
      title: 'Dosage Timing',
      versions: '*',
      format: 'period',
      getter: (m) => m.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod,
    },
    {
      title: 'Route',
      versions: '*',
      format: 'codeableConcept',
      getter: (m) => m.dosageInstruction?.[0]?.route,
    },
    { title: 'Do Not Perform', versions: '*', getter: (m) => m.doNotPerform },
    {
      title: 'Reason',
      versions: '*',
      format: 'codeableConcept',
      getter: (m) => m.reasonCode?.[0],
    },
  ];
}

@Component({
  selector: 'search-datatable-medication',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableMedicationComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Medication',
      versions: '*',
      format: 'codeableConcept',
      getter: (c) => c.code,
    },
    {
      title: 'Date Prescribed',
      versions: '*',
      format: 'date',
      getter: (c) => c.authoredOn,
    },
    { title: 'Status', versions: '*', getter: (c) => c.status },
  ];
}

@Component({
  selector: 'search-datatable-nutrition-order',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableNutritionOrderComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Preference',
      versions: '*',
      format: 'code',
      getter: (n) => n.foodPreferenceModifier?.[0].coding?.[0],
    },
    {
      title: 'Exclusion',
      versions: '*',
      format: 'code',
      getter: (n) => n.excludeFoodModifier?.[0].coding?.[0],
    },
    { title: 'Date', versions: '*', format: 'date', getter: (n) => n.dateTime },
    { title: 'Status', versions: '*', getter: (n) => n.status },
  ];
}

@Component({
  selector: 'search-datatable-observation',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableObservationComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Issued Date',
      versions: '*',
      format: 'date',
      getter: (o) => o.issued,
    },
    {
      title: 'Effective',
      versions: '*',
      getter: (o) => attributeXTime(o, 'effective'),
    },
    {
      title: 'Observation',
      versions: '*',
      format: 'codeableConcept',
      getter: (o) => o.code,
    },
    { title: 'Value', versions: '*', getter: (o) => obsValue(o) },
    { title: 'ID', versions: '*', getter: (o) => o.id },
  ];
}

@Component({
  selector: 'search-datatable-organization',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableOrganizationComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', getter: (d) => d.name || d.alias?.[0] },
    {
      title: 'Address',
      versions: '*',
      format: 'address',
      getter: (d) => d.address?.[0],
    },
    {
      title: 'Contact',
      versions: '*',
      format: 'contact',
      getter: (d) => d.telecom?.[0],
    },
  ];
}

@Component({
  selector: 'search-datatable-patient',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatablePatientComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Name',
      versions: '*',
      format: 'humanName',
      getter: (p) => p.name?.[0],
    },
    { title: 'DOB', versions: '*', getter: (p) => p.birthDate, format: 'date' },
  ];
}

@Component({
  selector: 'search-datatable-practitioner',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatablePractitionerComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Name',
      versions: '*',
      format: 'humanName',
      getter: (p) => p.name?.[0],
    },
    {
      title: 'Role',
      versions: '*',
      format: 'codeableConcept',
      getter: (p) => p.role?.[0],
    },
  ];
}

@Component({
  selector: 'search-datatable-procedure',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableProcedureComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Code',
      versions: '*',
      format: 'codeableConcept',
      getter: (p) => p.code,
    },
    {
      title: 'Performed',
      versions: '*',
      getter: (p) => attributeXTime(p, 'performed'),
    },
    {
      title: 'Reason',
      versions: '*',
      format: 'codeableConcept',
      getter: (p) => p.reasonCode?.[0],
    },
  ];
}

@Component({
  selector: 'search-datatable-practitioner-role',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatablePractitionerRoleComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Practitioner',
      versions: '*',
      getter: (p) => p.practitioner?.display,
    },
    {
      title: 'Role',
      versions: '*',
      format: 'codeableConcept',
      getter: (p) => p.code?.[0],
    },
  ];
}

@Component({
  selector: 'search-datatable-related-person',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableRelatedPersonComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    {
      title: 'Name',
      versions: '*',
      format: 'humanName',
      getter: (p) => p.name?.[0],
    },
    {
      title: 'Relationship',
      versions: '*',
      format: 'codeableConcept',
      getter: (p) => p.relationship?.[0],
    },
  ];
}

@Component({
  selector: 'search-datatable-risk-assessment',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableRiskAssessmentComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Date', versions: '*', format: 'date', getter: (r) => r.date },
    {
      title: 'Prediction',
      versions: '*',
      format: 'codeableConcept',
      getter: (r) => r.prediction?.[0]?.outcome,
    },
    { title: 'Status', versions: '*', getter: (r) => r.status },
  ];
}

@Component({
  selector: 'search-datatable-service-request',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class DatatableServiceRequestComponent extends SearchDatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    // orig { title: 'Service', versions: '*', format: 'code', getter: s => s.code.coding[0] },
    {
      title: 'Author Date',
      versions: '*',
      format: 'date',
      getter: (s) => s.authoredOn,
    },
    {
      title: 'Service',
      versions: '*',
      format: 'codeableConcept',
      getter: (s) => s.category?.[0],
    },
    {
      title: 'Ordered',
      versions: '*',
      format: 'codeableConcept',
      getter: (s) => s.code,
    },
    {
      title: 'Dx',
      versions: '*',
      format: 'codeableConcept',
      getter: (s) => s.reasonCode?.[0],
    }, //Was Task
    { title: 'Ordered By', versions: '*', getter: (s) => s.requester?.display },
    { title: 'Status', versions: '*', getter: (s) => s.status },
    // Useless { title: 'ID', versions: '*', getter: s => s.id },
    // Not used { title: 'Do Not Perform', versions: '*', getter: s => s.doNotPerform },
    // Not used { title: 'Reason Refused', versions: '*', format: 'code', getter: s => s.extension.reasonRefused.coding[0] }
  ];
}
