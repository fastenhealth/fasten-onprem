import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import {MedicalSourcesCardComponent} from './medical-sources-card.component'
import { PatientAccessBrand } from 'src/app/models/patient-access-brands';
import { ImageFallbackDirective } from 'src/app/directives/image-fallback.directive';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<MedicalSourcesCardComponent> = {
  title: 'Components/MedicalSourcesCard',
  component: MedicalSourcesCardComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div style="width: 300px">${story}</div>`),
    moduleMetadata({
      declarations: [ImageFallbackDirective]
    })
  ],
  tags: ['autodocs'],
  render: (args) => ({
    props: {
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

const brand: PatientAccessBrand = {
  id: 'b53c77ed-c0f4-4d6a-bddf-5c0e3934c2d6',
  name: 'Aetna',
  last_updated: '2024-01-12T05:20:50.52Z',
  portal_ids: []
};

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Entry: Story = {
  args: {
    sourceInfo: {
      brand: brand
    },
  }
};

export const LoadingAuthorize: Story = {
  args: {
    sourceInfo: {
      brand: brand
    },
    status: 'authorize'
  },
};

export const LoadingToken: Story = {
  args: {
    sourceInfo: {
      brand: brand
    },
    status: 'token'
  },
};

export const Failed: Story = {
  args: {
    sourceInfo: {
      brand: brand
    },
    status: 'failed'
  },
};

export const MissingLogo: Story = {
  args: {
    sourceInfo: {
      brand: {
        ...brand,
        id: 'aetna-123',
      }
    }
  },
};
