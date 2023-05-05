import type { Meta, StoryObj } from '@storybook/angular';
import {fhirVersions} from "../../../../../lib/models/constants";
import R4Example1Json from "../../../../../lib/fixtures/r4/resources/binary/exampleText.json";
import {BinaryTextComponent} from "./binary-text.component";
import {BinaryModel} from "../../../../../lib/models/resources/binary-model";



// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<BinaryTextComponent> = {
  title: 'Fhir/Datatypes/BinaryText',
  component: BinaryTextComponent,
  decorators: [
    // moduleMetadata({
    //   imports: [AppModule]
    // })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: BinaryTextComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    displayModel: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<BinaryTextComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
let aiDisplayModel1 =  new BinaryModel(R4Example1Json, fhirVersions.R4)
aiDisplayModel1.source_id = '123-456-789'
aiDisplayModel1.source_resource_id = '123-456-789'
export const R4Example1: Story = {
  args: {
    displayModel: aiDisplayModel1
  }
};

