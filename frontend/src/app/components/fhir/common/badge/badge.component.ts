import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'fhir-ui-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit {
  @Input() status: string = ""

  constructor() { }

  ngOnInit(): void {
  }

  getBadgeStatusColor(status): string {
    let lookup = {
      // condition
      active: 'badge-primary',
      recurrence: '',
      relapse: 'badge-info',
      inactive: 'badge-secondary',
      remission: 'badge-info',
      resolved: 'badge-primary',
      // immunization
      'in-progress': 'badge-warning',
      'on-hold': 'badge-secondary',
      completed: 'badge-success',
      'entered-in-error': 'badge-error',
      stopped: 'badge-secondary',
      'not-done': 'badge-warning',
      // procedure
      preparation: 'badge-primary',
      suspended: '',
      aborted: '',
      unknown: 'badge-secondary',
      // practitioner
      // allergy intolerance
      unconfirmed: '',
      confirmed: '',
      refuted: '',
      // appointment
      proposed: '',
      pending: '',
      booked: '',
      arrived: '',
      fulfilled: '',
      cancelled: '',
      noshow: '',
      'checked-in': '',
      waitlist: '',
      // care plan
      draft: '',
      revoked: '',
      // care team
      // claim
      // claim response
      // device
      available: '',
      'not-available': '',
      // diagnostic report
      registered: '',
      partial: '',
      preliminary: '',
      final: '',
      corrected: '',
      appended: '',
      // document reference
      current: '',
      superseded: '',
      // encounter
      planned: '',
      triaged: '',
      onleave: '',
      finished: '',
      // explanation of benefit
      // family member history
      'health-unknown': '',
      // goal
      accepted: '',
      rejected: '',
      achieved: '',
      sustaining: '',
      'on-target': '',
      'ahead-of-target': '',
      'behind-target': '',
      // list
      retired: '',
      // location
      // mediacation
      brand: '',
      // medication administration
      // medication knowledge
      // medication statement
      intended: '',
      'not-taken': '',
      // observation
      amended: '',
      // procedure
      // questionnaire
      published: '',
      // questionnaire response
      // research study
      'administratively-completed': '',
      approved: '',
      'closed-to-accrual': '',
      'closed-to-accrual-and-intervention': '',
      disapproved: '',
      'in-review': '',
      'temporarily-closed-to-accrual': '',
      'temporarily-closed-to-accrual-and-intervention': '',
      withdrawn: '',
    };
    return lookup[status] || 'badge-secondary'
  }

}
