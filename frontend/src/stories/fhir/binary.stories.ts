import type {Meta, StoryObj} from '@storybook/angular';
import {BinaryComponent} from '../../app/components/fhir/resources/binary/binary.component';
import {fhirModelFactory} from '../../lib/models/factory';
import {fhirVersions, ResourceType} from '../../lib/models/constants';

import r4_example1 from '../../lib/fixtures/r4/resources/binary/example1.json';
import r4_example2 from '../../lib/fixtures/r4/resources/binary/example2.json';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {moduleMetadata} from '@storybook/angular';
import {BinaryModel} from '../../lib/models/resources/binary-model';
import {AppModule} from '../../app/app.module';
import {FastenApiService} from '../../app/services/fasten-api.service';
import {HttpClientModule} from '@angular/common/http';
import {AuthService} from '../../app/services/auth.service';
import {SharedModule} from '../../app/components/shared.module';
import {FhirModule} from '../../app/components/fhir/fhir.module';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<BinaryComponent> = {
  title: 'Fhir/Binary',
  component: BinaryComponent,
  decorators: [
    moduleMetadata({
      imports: [ FhirModule],
      providers: [FastenApiService, AuthService],
    })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: BinaryComponent) => ({
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
type Story = StoryObj<BinaryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args

export const PdfExample: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.Binary,
      {
        resource_raw: r4_example1,
      }, fhirVersions.R4) as BinaryModel
  }
};
export const PhotoExample: Story = {
  args: {
    displayModel: fhirModelFactory(
      ResourceType.Binary,
      {
        resource_raw: r4_example2,
      }, fhirVersions.R4) as BinaryModel
  }
};
