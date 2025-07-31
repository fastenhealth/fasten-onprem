import type { Meta, StoryObj } from '@storybook/angular';
import {GlossaryLookupComponent} from "./glossary-lookup.component";
import {componentWrapperDecorator, moduleMetadata} from "@storybook/angular";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {HTTP_CLIENT_TOKEN} from "../../dependency-injection";


//Use decorators to override Angular dependency injection for HttpClient
// https://github.com/storybookjs/storybook/blob/d64e49ba1a715db73a3d6c697517fe6a85a8f8ef/examples/angular-cli/src/stories/addons/toolbars/locales/translate.service.ts
// https://www.tektutorialshub.com/angular/injection-token-in-angular/
// https://medium.com/ngconf/configure-your-angular-apps-with-an-injection-token-be16eee59c40

const withHttpClientProvider = (storyFunc, context) => {
  const { httpClientResp } = context.parameters;
  // uses `moduleMetadata` decorator to cleanly add locale provider into module metadata

  // It is also possible to do it directly in story with
  // ```
  // const sotry = storyFunc();
  // sotry.moduleMetadata = {
  //   ...sotry.moduleMetadata,
  //   providers: [
  //     ...(sotry.moduleMetadata?.providers ?? []),
  //     { provide: DEFAULT_LOCALE, useValue: locale },
  //   ],
  // };
  // return sotry;
  // ```
  // but more verbose
  class MockHttpClient extends HttpClient {

    get(): Observable<any> {
      return of(httpClientResp)
    }
  }

  return moduleMetadata({ providers: [{ provide: HTTP_CLIENT_TOKEN, useClass: MockHttpClient }] })(
    storyFunc,
    context
  );
};


// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<GlossaryLookupComponent> = {
  title: 'Components/GlossaryLookup',
  component: GlossaryLookupComponent,
  decorators: [
    withHttpClientProvider,
    moduleMetadata({
      imports: [HttpClientModule],
    }),
  ],
  tags: ['autodocs'],
  render: (args: GlossaryLookupComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    code: {
      control: 'text',
    },
    codeSystem: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<GlossaryLookupComponent>;


export const Html: Story = {
  args: {
    code: "21000-5",
    codeSystem: "2.16.840.1.113883.6.96"
  },
  parameters: {
    httpClientResp: {
      url: "https://medlineplus.gov/lab-tests/rdw-red-cell-distribution-width?utm_source=mplusconnect&utm_medium=service",
      publisher: "U.S. National Library of Medicine",
      description: "<h2>What is a Red Cell Distribution Width Test?</h2>\n" +
        "<p>A red cell distribution width (RDW) test measures the differences in the volume and size of your red blood cells (erythrocytes). Red blood cells carry oxygen from your lungs to every cell in your body. Your cells need oxygen to grow, make new cells, and stay healthy.</p>\n" +
        "<p>Normally, your red blood cells are all about the same size. A high RDW means that there's a major difference between the size of your smallest and largest red blood cells. This may be a sign of a medical condition.</p>\n" +
        "<p>Other names: RDW-SD (standard deviation) test, Erythrocyte Distribution Width</p><h2>What is it used for?</h2>\n" +
        "<p>The RDW blood test is often part of a <a data-pid=\"728\" href=\"https://medlineplus.gov/lab-tests/complete-blood-count-cbc/\">complete blood count (CBC)</a>, a test that measures many different parts of your blood, including red cells. The RDW test is commonly used to help diagnose <a data-tid=\"139\" href=\"https://medlineplus.gov/anemia.html\">anemia</a>, a condition in which your red blood cells can't carry enough oxygen to the rest of your body.</p>\n" +
        "<p>The RDW test may also be used with other tests to help diagnose other conditions, including <a data-tid=\"4239\" href=\"https://medlineplus.gov/thalassemia.html\">thalassemia</a>, an inherited disease that can cause severe anemia.</p><h2>Why do I need an RDW test?</h2>\n" +
        "<p>Your health care provider may have ordered a complete blood count, which includes an RDW test, as part of a routine exam, or if you have:</p>\n" +
        "<ul>\n" +
        "<li>Symptoms of anemia, including weakness, <a data-tid=\"216\" href=\"https://medlineplus.gov/dizzinessandvertigo.html\">dizziness</a>, pale skin, and cold hands and feet</li>\n" +
        "<li>A family history of thalassemia, <a data-tid=\"402\" href=\"https://medlineplus.gov/sicklecelldisease.html\">sickle cell anemia</a>, or other inherited blood disorder</li>\n" +
        "<li>A chronic illness such as <a data-tid=\"119\" href=\"https://medlineplus.gov/crohnsdisease.html\">Crohn's disease</a>, diabetes, or <a data-tid=\"1\" href=\"https://medlineplus.gov/hivaids.html\">HIV/AIDS</a></li>\n" +
        "<li>A diet low in <a data-tid=\"5542\" href=\"https://medlineplus.gov/iron.html\">iron</a> and other <a data-tid=\"4298\" href=\"https://medlineplus.gov/minerals.html\">minerals</a></li>\n" +
        "<li>A long-term infection</li>\n" +
        "<li>Excessive <a data-tid=\"6039\" href=\"https://medlineplus.gov/bleeding.html\">blood loss</a> from an injury or surgical procedure</li>\n" +
        "</ul><h2>What happens during an RDW test?</h2>\n" +
        "<p>A health care professional will take a blood sample from a vein in your arm, using a small needle. After the needle is inserted, a small amount of blood will be collected into a test tube or vial. You may feel a little sting when the needle goes in or out. This process generally takes less than five minutes.</p><h2>Will I need to do anything to prepare for the test?</h2>\n" +
        "<p>No special preparation is necessary.</p><h2>Are there any risks to the test?</h2>\n" +
        "<p>There is very little risk to a blood test. You may experience slight pain or bruising at the spot where the needle was put in, but most symptoms go away quickly.</p><h2>What do the results mean?</h2>\n" +
        "<p>RDW results help your provider understand how much your red blood cells vary in size and volume. Even if your RDW results are normal, you may still have a medical condition that needs treatment. That's why your provider will usually look at your RDW results along with the results of other blood tests. The combined test results can show a more complete picture of your red blood cells to help diagnose a variety of conditions, including:</p>\n" +
        "<ul>\n" +
        "<li>Iron deficiency</li>\n" +
        "<li>Different types of anemia</li>\n" +
        "<li>Thalassemia</li>\n" +
        "<li>Sickle cell anemia</li>\n" +
        "</ul>\n" +
        "<p>A high RDW result can also be a sign of other conditions, such as:</p>\n" +
        "<ul>\n" +
        "<li>Chronic <a data-tid=\"310\" href=\"https://medlineplus.gov/liverdiseases.html\">liver disease</a></li>\n" +
        "<li><a data-tid=\"277\" href=\"https://medlineplus.gov/heartdiseases.html\">Heart disease</a></li>\n" +
        "<li><a data-tid=\"4\" href=\"https://medlineplus.gov/diabetes.html\">Diabetes</a></li>\n" +
        "<li><a data-tid=\"91\" href=\"https://medlineplus.gov/kidneydiseases.html\">Kidney disease</a></li>\n" +
        "<li><a data-tid=\"25\" href=\"https://medlineplus.gov/cancer.html\">Cancer</a>, especially <a data-tid=\"88\" href=\"https://medlineplus.gov/colorectalcancer.html\">colorectal cancer</a></li>\n" +
        "</ul>\n" +
        "<p>Your provider will most likely need more tests to confirm a diagnosis.</p>\n" +
        "<p>Learn more about <a data-pid=\"806\" href=\"https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/\">laboratory tests, reference ranges, and understanding results</a>.</p><h2>Is there anything else I need to know about a red cell distribution width test?</h2>\n" +
        "<p>If your test results indicate you have a chronic blood disorder, such as anemia, you may be put on a treatment plan to increase the amount of oxygen that your red blood cells can carry. Depending on your specific condition, your provider may recommend iron supplements, medicines, and/or changes in your diet.</p>\n" +
        "<p>Be sure to talk to your provider before taking any supplements or making any changes in your eating plan.</p><h2>References</h2>\n" +
        "<ol>\n" +
        "<li>Lee H, Kong S, Sohn Y, Shim H, Youn H, Lee S, Kim H, Eom H. Elevated Red Blood Cell Distribution Width as a Simple Prognostic Factor in Patients with Symptomatic Multiple Myeloma. Biomed Research International [Internet]. 2014 May 21 [cited 2017 Jan 24]; 2014(Article ID 145619, 8 pages). Available from: <a href=\"https://www.hindawi.com/journals/bmri/2014/145619/cta/\" target=\"bibliowin\">https://www.hindawi.com/journals/bmri/2014/145619/cta/</a></li>\n" +
        "<li>May Jori E, Marques Marisa B, Reddy Vishnu VB, Gangaraju Radhika. Three neglected numbers in the CBC: The RDW, MPV, and NRBC count. Cleveland Clinic Journal of Medicine [Internet]. 2019 Mar [cited 2021 Dec 22];86(3):167-172. Available from: <a href=\"https://www.ccjm.org/content/86/3/167 doi: 10.3949/ccjm.86a.18072\" target=\"bibliowin\">https://www.ccjm.org/content/86/3/167 doi: 10.3949/ccjm.86a.18072</a></li>\n" +
        "<li>Mayo Clinic [Internet].Mayo Foundation for Medical Education and Research; c1998-2021. Macrocytosis: What causes it?; 6 [cited 2021 Dec 22]; [about 3 screens]. Available from: <a href=\"http://www.mayoclinic.org/macrocytosis/expert-answers/faq-20058234.\" target=\"bibliowin\">http://www.mayoclinic.org/macrocytosis/expert-answers/faq-20058234.</a></li>\n" +
        "<li>National Heart, Lung, and Blood Institute [Internet]. Bethesda (MD): U.S. Department of Health and Human Services; Thalessemias; [cited 2021 Dec 22]; [about 27 screens]. Available from: <a href=\"https://www.nhlbi.nih.gov/health/health-topics/topics/thalassemia/\" target=\"bibliowin\">https://www.nhlbi.nih.gov/health/health-topics/topics/thalassemia/</a></li>\n" +
        "<li>National Heart, Lung, and Blood Institute [Internet]. Bethesda (MD): U.S. Department of Health and Human Services; Anemia: Overview; [updated 2012 May 18; cited 2021 Dec 22]; [about 2 screens]. Available from: <a href=\"https://www.nhlbi.nih.gov/health/health-topics/topics/anemia/treatment\" target=\"bibliowin\">https://www.nhlbi.nih.gov/health/health-topics/topics/anemia/treatment</a></li>\n" +
        "<li>National Heart, Lung, and Blood Institute [Internet]. Bethesda (MD): U.S. Department of Health and Human Services; Blood Tests; [updated 2012; cited 2021 Dec 22]; [about 19 screens]. Available from: <a href=\"https://www.nhlbi.nih.gov/health-topics/blood-tests\" target=\"bibliowin\">https://www.nhlbi.nih.gov/health-topics/blood-tests</a></li>\n" +
        "<li>Salvagno G, Sanchis-Gomar F, Picanza A, Lippi G. Red blood cell distribution width: A simple parameter with multiple clinical applications. Critical Reviews in Laboratory Science [Internet]. 2014 Dec 23 [cited 2017 Jan 24]; 52 (2): 86-105. Available from: <a href=\"http://www.tandfonline.com/doi/full/10.3109/10408363.2014.992064\" target=\"bibliowin\">http://www.tandfonline.com/doi/full/10.3109/10408363.2014.992064</a></li>\n" +
        "<li>Song Y, Huang Z, Kang Y, Lin Z, Lu P, Cai Z,  Cao Y, ZHuX. Clinical Usefulness and Prognostic Value of Red Cell Distribution Width in Colorectal Cancer. Biomed Res Int [Internet]. 2018 Dec [cited 2019 Jan 27]; 2018 Article ID, 9858943. Available from: <a href=\"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6311266\" target=\"bibliowin\">https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6311266</a></li>\n" +
        "<li>Thame M, Grandison Y, Mason K Higgs D, Morris J, Serjeant B, Serjeant G. The red cell distribution width in sickle cell disease—is it of clinical value? International Journal of Laboratory Hematology [Internet]. 1991 Sep [cited 2017 Jan 24]; 13 (3): 229-237. Available from: <a href=\"http://onlinelibrary.wiley.com/wol1/doi/10.1111/j.1365-2257.1991.tb00277.x/abstract\" target=\"bibliowin\">http://onlinelibrary.wiley.com/wol1/doi/10.1111/j.1365-2257.1991.tb00277.x/abstract</a></li>\n" +
        "</ol>",
    }
  }
};

// Wrap in small width div to verify that text doesn't overflow horizontally. Border included to make it easier to verify overflow.
export const HorizontalOverflow: Story = {
  args: Html.args,
  parameters: Html.parameters,
  decorators: [componentWrapperDecorator((story) => `<div style="width: 300px; border-style: solid">${story}</div>`)]
};

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Empty: Story = {
};

export const PlainText: Story = {
  args: {
    code: "36955009",
    codeSystem: "2.16.840.1.113883.6.96"
  },
  parameters: {
    httpClientResp: {
      url: "https://www.nidcr.nih.gov/health-info/taste-disorders/more-info?utm_source=medlineplus-connect&utm_medium=website&utm_campaign=mlp-connect",
      publisher: "U.S. National Library of Medicine",
      description: "Problems with the sense of taste can have a big impact on life. Taste stimulates the desire to eat and therefore plays a key role in nutrition. The sense of taste also helps keep us healthy by helping us detect spoiled food or drinks.",
    }
  }
};
