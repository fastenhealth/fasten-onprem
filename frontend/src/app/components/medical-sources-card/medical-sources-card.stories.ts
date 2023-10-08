import type { Meta, StoryObj } from '@storybook/angular';
import {MedicalSourcesCardComponent} from './medical-sources-card.component'

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<MedicalSourcesCardComponent> = {
  title: 'Components/MedicalSourcesCard',
  component: MedicalSourcesCardComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: MedicalSourcesCardComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    sourceInfo: {
      control: 'object',
    },
    status: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<MedicalSourcesCardComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Entry: Story = {
  args: {
    sourceInfo: {
      metadata: {
        // aliases?: string[]
        // brand_logo?: string
        category: [],
        display: "Aetna",
        hidden: false,
        // identifiers?: {[name:string]: string}
        // patient_access_description?: string
        // patient_access_url?: string
        platform_type: "aetna",
        source_type: "aetna"
      }
    }
  }
};

export const LoadingAuthorize: Story = {
  args: {
    sourceInfo: {
      metadata: {
        // aliases?: string[]
        // brand_logo?: string
        category: [],
        display: "Aetna",
        hidden: false,
        // identifiers?: {[name:string]: string}
        // patient_access_description?: string
        // patient_access_url?: string
        platform_type: "aetna",
        source_type: "aetna"
      }
    },
    status: 'authorize'
  },
};

export const LoadingToken: Story = {
  args: {
    sourceInfo: {
      metadata: {
        // aliases?: string[]
        // brand_logo?: string
        category: [],
        display: "Aetna",
        hidden: false,
        // identifiers?: {[name:string]: string}
        // patient_access_description?: string
        // patient_access_url?: string
        platform_type: "aetna",
        source_type: "aetna"
      }
    },
    status: 'token'
  },
};

export const Failed: Story = {
  args: {
    sourceInfo: {
      metadata: {
        // aliases?: string[]
        // brand_logo?: string
        category: [],
        display: "Aetna",
        hidden: false,
        // identifiers?: {[name:string]: string}
        // patient_access_description?: string
        // patient_access_url?: string
        platform_type: "aetna",
        source_type: "aetna"
      }
    },
    status: 'failed'
  },
};


export const Hidden: Story = {
  args: {
    sourceInfo: {
      metadata: {
        // aliases?: string[]
        // brand_logo?: string
        category: [],
        display: "Aetna",
        hidden: true,
        // identifiers?: {[name:string]: string}
        // patient_access_description?: string
        // patient_access_url?: string
        platform_type: "aetna",
        source_type: "aetna"
      }
    }
  },
};

export const CustomBrandLogo: Story = {
  args: {
    sourceInfo: {
      metadata: {
        // aliases?: string[]
        brand_logo: 'bluebutton.png',
        category: [],
        display: "Aetna",
        hidden: false,
        // identifiers?: {[name:string]: string}
        // patient_access_description?: string
        // patient_access_url?: string
        platform_type: "aetna",
        source_type: "aetna"
      }
    }
  },
};
