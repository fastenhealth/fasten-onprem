import type { Meta, StoryObj } from '@storybook/angular';
import {BadgeComponent} from "./badge.component";

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<BadgeComponent> = {
  title: 'Fhir Card/Common/Badge',
  component: BadgeComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: BadgeComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    status: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Primary: Story = {
  args: {
    status: "active",
  }
};

export const Secondary: Story = {
  args: {
    status: 'refuted'
  },
};

