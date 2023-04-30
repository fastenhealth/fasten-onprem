import type {Meta, StoryObj} from '@storybook/angular';
import {AllergyIntoleranceComponent} from '../../app/components/fhir/resources/allergy-intolerance/allergy-intolerance.component';
import {fhirModelFactory} from '../../lib/models/factory';
import {fhirVersions, ResourceType} from '../../lib/models/constants';

import stu3_example1 from '../../lib/fixtures/stu3/resources/allergyIntolerance/example1.json';
import stu3_example2 from '../../lib/fixtures/stu3/resources/allergyIntolerance/example2.json';
import r4_example1 from '../../lib/fixtures/r4/resources/allergyIntolerance/example1.json';
import r4_example2 from '../../lib/fixtures/r4/resources/allergyIntolerance/example2.json';
import r4_example3 from '../../lib/fixtures/r4/resources/allergyIntolerance/example3.json';
import {AllergyIntoleranceModel} from '../../lib/models/resources/allergy-intolerance-model';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {moduleMetadata} from '@storybook/angular';
import {FhirModule} from '../../app/components/fhir/fhir.module';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<AllergyIntoleranceComponent> = {
  title: 'Fhir/AllergyIntolerance',
  component: AllergyIntoleranceComponent,
  decorators: [
    moduleMetadata({
      imports: [FhirModule]
    })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: AllergyIntoleranceComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    showDetails: {
      control: 'boolean',
    }
  },
};

export default meta;
type Story = StoryObj<AllergyIntoleranceComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Dstu2Example1: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.AllergyIntolerance,
{
      resource_raw: stu3_example1,
      }, fhirVersions.DSTU2) as AllergyIntoleranceModel
  }
};
export const Dstu2Example2: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.AllergyIntolerance,
      {
        resource_raw: stu3_example2,
      }, fhirVersions.DSTU2) as AllergyIntoleranceModel
  }
};
export const R4Example1: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.AllergyIntolerance,
      {
        resource_raw: r4_example1,
      }, fhirVersions.R4) as AllergyIntoleranceModel
  }
};
export const R4Example2: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.AllergyIntolerance,
      {
        resource_raw: r4_example2,
      }, fhirVersions.R4) as AllergyIntoleranceModel
  }
};
export const R4Example3: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.AllergyIntolerance,
      {
        resource_raw: r4_example3,
      }, fhirVersions.R4) as AllergyIntoleranceModel
  }
};
export const Stu3Example1: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.AllergyIntolerance,
      {
        resource_raw: stu3_example1,
      }, fhirVersions.STU3) as AllergyIntoleranceModel
  }
};
export const Stu3Example2: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.AllergyIntolerance,
      {
        resource_raw: stu3_example2,
      }, fhirVersions.STU3) as AllergyIntoleranceModel
  }
};
