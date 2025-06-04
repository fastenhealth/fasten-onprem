import type { Meta, StoryObj } from '@storybook/angular';
import {MedicalRecordWizardEditOrganizationComponent} from './medical-record-wizard-edit-organization.component';
import {applicationConfig} from '@storybook/angular';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {importProvidersFrom} from '@angular/core';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<MedicalRecordWizardEditOrganizationComponent> = {
  title: 'Components/MedicalRecordWizardEditOrganization',
  component: MedicalRecordWizardEditOrganizationComponent,
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(HttpClientTestingModule),
        NgbActiveModal,
        {
          provide: HttpClient,
          useClass: HttpClient
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        }
      ]
    }),
  ],
  tags: ['autodocs'],
  render: (args: MedicalRecordWizardEditOrganizationComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
  },
};

export default meta;
type Story = StoryObj<MedicalRecordWizardEditOrganizationComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Primary: Story = {};

