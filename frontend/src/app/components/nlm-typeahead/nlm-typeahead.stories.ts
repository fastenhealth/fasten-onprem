import type {Meta, StoryObj} from '@storybook/angular';
import {applicationConfig} from '@storybook/angular';
import {NlmSearchType, NlmTypeaheadComponent} from './nlm-typeahead.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {importProvidersFrom} from '@angular/core';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<NlmTypeaheadComponent> = {
  title: 'Components/NlmTypeahead',
  component: NlmTypeaheadComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    applicationConfig({
      providers: [
        importProvidersFrom(HttpClientModule),
        {
          provide: HttpClient,
          useClass: HttpClient
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        }
      ],
    }),
  ],
  tags: ['autodocs'],
  render: (args: NlmTypeaheadComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    searchType: {
      control: 'text',
    },
    debugMode: {
      control: 'boolean',
    }
  },
};

export default meta;
type Story = StoryObj<NlmTypeaheadComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Allergy: Story = {
  args: {
    searchType: NlmSearchType.Allergy,
    debugMode: true
  }
};

export const AllergyReaction: Story = {
  args: {
    searchType: NlmSearchType.AllergyReaction,
    debugMode: true
  }
};

export const Condition: Story = {
  args: {
    searchType: NlmSearchType.Condition,
    debugMode: true
  }
};

export const MedicalContactIndividualProfession: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactIndividualProfession,
    debugMode: true
  }
};

export const MedicalContactIndividual: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactIndividual,
    debugMode: true
  }
};

export const MedicalContactOrganization: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactOrganization,
    debugMode: true
  }
};

export const MedicalContactOrganizationType: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactOrganizationType,
    debugMode: true
  }
};

export const Medication: Story = {
  args: {
    searchType: NlmSearchType.Medication,
    debugMode: true
  }
};

export const MedicationWhyStopped: Story = {
  args: {
    searchType: NlmSearchType.MedicationWhyStopped,
    debugMode: true
  }
};

export const Procedure: Story = {
  args: {
    searchType: NlmSearchType.Procedure,
    debugMode: true
  }
};

export const Vaccine: Story = {
  args: {
    searchType: NlmSearchType.Vaccine,
    debugMode: true
  }
};

export const Countries: Story = {
  args: {
    searchType: NlmSearchType.Countries,
    debugMode: true
  }
};

export const AttachmentFileType: Story = {
  args: {
    searchType: NlmSearchType.AttachmentFileType,
    debugMode: true
  }
};

export const AttachmentCategory: Story = {
  args: {
    searchType: NlmSearchType.AttachmentCategory,
    debugMode: true
  }
};

export const EncounterClassification: Story = {
  args: {
    searchType: NlmSearchType.EncounterClassification,
    debugMode: true
  }
};

export const EncounterServiceType: Story = {
  args: {
    searchType: NlmSearchType.EncounterServiceType,
    debugMode: true
  }
};

export const PrePopulated: Story = {
  args: {
    searchType: NlmSearchType.PrePopulated,
    debugMode: true
  }
};
