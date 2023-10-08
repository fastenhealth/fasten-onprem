import type { Meta, StoryObj } from '@storybook/angular';
import {ToastComponent} from './toast.component';
import {ToastService} from '../../services/toast.service';
import {moduleMetadata} from '@storybook/angular';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<ToastComponent> = {
  title: 'Components/ToastComponent',
  component: ToastComponent,
  decorators: [
    moduleMetadata({
      imports: [NgbModule]
    })
    // applicationConfig({
    //   providers: [importProvidersFrom(AppModule)],
    // }),
  ],
  tags: ['autodocs'],
  render: (args: ToastComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    toastService: {
      description: 'ToastService',
      control: {
        type: 'object',
      }
    }
  },
};

export default meta;
type Story = StoryObj<ToastComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Success: Story = {

  args: {
    toastService: {
      toasts: [{
        event_date: new Date(),
        autohide: false,
        type: ToastType.Success,
        title: 'Success',
        displayClass: 'demo-static-toast bg-indigo text-light',
        message: 'This is a success message'
      }],
      show: (toastNotification: ToastNotification) => {},
      remove: (toastNotification: ToastNotification) => {},
      clear: () => {}
    }
  }
};

export const Error: Story = {

  args: {
    toastService: {
      toasts: [{
        event_date: new Date(),
        autohide: false,
        type: ToastType.Error,
        title: 'Error',
        displayClass: 'demo-static-toast bg-danger text-light',
        message: 'This is an error message'
      }],
      show: (toastNotification: ToastNotification) => {},
      remove: (toastNotification: ToastNotification) => {},
      clear: () => {}
    }
  }
};

export const Link: Story = {

  args: {
    toastService: {
      toasts: [{
        event_date: new Date(),
        autohide: false,
        type: ToastType.Error,
        title: 'Error',
        displayClass: 'demo-static-toast bg-danger text-light',
        message: 'This is an error message',
        link: {
          text: 'Click here',
          url: '/background-jobs'
        }
      }],
      show: (toastNotification: ToastNotification) => {},
      remove: (toastNotification: ToastNotification) => {},
      clear: () => {}
    }
  }
};
