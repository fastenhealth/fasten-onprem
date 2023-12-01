import type {Meta, StoryObj} from '@storybook/angular';
import {applicationConfig} from '@storybook/angular';
import {NlmSearchType, NlmTypeaheadComponent} from './nlm-typeahead.component';
import {HttpClient} from '@angular/common/http';
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
        importProvidersFrom(HttpClientTestingModule),
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
    searchType: NlmSearchType.Allergy
  }
};

export const AllergyReaction: Story = {
  args: {
    searchType: NlmSearchType.AllergyReaction
  }
};

export const Condition: Story = {
  args: {
    searchType: NlmSearchType.Condition
  }
};

export const MedicalContactIndividualProfession: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactIndividualProfession
  }
};

export const MedicalContactIndividual: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactIndividual
  }
};

export const MedicalContactOrganization: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactOrganization
  }
};

export const MedicalContactOrganizationType: Story = {
  args: {
    searchType: NlmSearchType.MedicalContactOrganizationType
  }
};

export const Medication: Story = {
  args: {
    searchType: NlmSearchType.Medication
  }
};

export const MedicationWhyStopped: Story = {
  args: {
    searchType: NlmSearchType.MedicationWhyStopped
  }
};

export const Procedure: Story = {
  args: {
    searchType: NlmSearchType.Procedure
  }
};

export const Vaccine: Story = {
  args: {
    searchType: NlmSearchType.Vaccine
  }
};

export const Countries: Story = {
  args: {
    searchType: NlmSearchType.Countries
  }
};

export const AttachmentFileType: Story = {
  args: {
    searchType: NlmSearchType.AttachmentFileType
  }
};

export const AttachmentCategory: Story = {
  args: {
    searchType: NlmSearchType.AttachmentCategory
  }
};

export const EncounterClassification: Story = {
  args: {
    searchType: NlmSearchType.EncounterClassification
  }
};

export const EncounterServiceType: Story = {
  args: {
    searchType: NlmSearchType.EncounterServiceType
  }
};

export const PrePopulated: Story = {
  args: {
    searchType: NlmSearchType.PrePopulated
  }
};
