<p align="center">
  <a href="https://github.com/fastenhealth/fasten-onprem">
  <img width="400" alt="fasten_view" src="frontend/src/assets/banner/banner.png">
  </a>
</p>

# Fasten - On Premise/Self-Hosted

[![CI](https://github.com/fastenhealth/fasten-onprem/actions/workflows/ci.yaml/badge.svg)](https://github.com/fastenhealth/fasten-onprem/actions/workflows/ci.yaml)
[![Discord Join](https://img.shields.io/discord/1023634406935642223?style=flat-square&logo=discord)](https://discord.gg/Bykz6BAN8p)
[![Request Providers](https://img.shields.io/static/v1?label=request+providers&message=form&color=orange&style=flat-square)](https://forms.gle/4oU8372y4KyM8DbdA)
[![Join Newsletter](https://img.shields.io/static/v1?label=join&message=mailing+list&color=blue&style=flat-square)](https://forms.gle/SNsYX9BNMXB6TuTw6)

**Fasten securely connects your healthcare providers together, creating a personal health record that never leaves your hands**

> [!NOTE]  
> NOTE: Fasten is a Work-in-Progress and can only communicate with a limited number of Healthcare Instutions (approx 25,000 at last count).
> Please fill out this [Google Form](https://forms.gle/SNsYX9BNMXB6TuTw6) if you'd like to be kept up-to-date on Fasten

> [!IMPORTANT]  
> To ensure Fasten's long-term sustainability, we're exploring some funding options. While we're still deciding a long-term monetization strategy, I'm kicking off with a crowdfunding/fundraising experiment for the first 500 users (including a surprise desktop app):
>
> - [Fasten Self-Hosted Lifetime License - **$200**](https://buy.stripe.com/fZe00deiUexS58Y4gg)
>
> Got questions or want to learn more about our fundraising experiment? [Click here to dive into the details & FAQs](https://docs.fastenhealth.com/funding.html) 


<p align="center">
  <br/>
  <br/>
  <a target="_blank" href="https://forms.gle/SNsYX9BNMXB6TuTw6">
    <img height="44px" alt="newsletter" src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/buttons/newsletter.png" />
  </a>
  <a target="_blank" href="https://docs.fastenhealth.com">
    <img height="44px" alt="documentation" src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/buttons/documentation.png" />
  </a>
  <br/>
  <br/>
</p>

<p align="center">
  <a href="https://imgur.com/a/vfgojBD">
  <img alt="fasten_view" src="https://i.imgur.com/jfqv5Q5.png">
  </a>
  <br/>
  <a href="https://imgur.com/a/vfgojBD">See more Fasten screenshots</a>
</p>


# Introduction

Like many of you, I've worked for many companies over my career. In that time, I've had multiple health, vision and dental 
insurance providers, and visited many different clinics, hospitals and labs to get procedures & tests done.

Recently I had a semi-serious medical issue, and I realized that my medical history (and the medical history of my family members) 
is a lot more complicated than I realized and distributed across the many healthcare providers I've used over the years. 
I wanted a single (private) location to store our medical records, and I just couldn't find any software that worked as I'd like:

- self-hosted/offline - this is my medical history, I'm not willing to give it to some random multi-national corporation to data-mine and sell 
- It should aggregate my data from multiple healthcare providers (insurance companies, hospital networks, clinics, labs) across multiple industries (vision, dental, medical) -- all in one dashboard 
- automatic - it should pull my EMR (electronic medical record) directly from my insurance provider/clinic/hospital network - I dont want to scan/OCR physical documents (unless I have to)
- open source - the code should be available for contributions & auditing

So, I built it

**Fasten is an open-source, self-hosted, personal/family electronic medical record aggregator, designed to integrate with 1000's of insurances/hospitals/clinics**

# Features

It's pretty basic right now, but it's designed with a easily extensible core around a solid foundation:

- Self-hosted
- Designed for families, not Clinics (unlike OpenEMR and other popular EMR systems)
- Supports the Medical industry's (semi-standard) FHIR protocol
- Uses OAuth2 (Smart-on-FHIR) authentication (no passwords necessary)
- Uses OAuth's `offline_access` scope (where possible) to automatically pull changes/updates
- Multi-user support for household/family use
- Condition specific user Dashboards & tracking for diagnostic tests
- (Future) Vaccination & condition specific recommendations using NIH/WHO clinical care guidelines (HEDIS/CQL) 
- (Future) ChatGPT-style interface to query your own medical history (offline)
- (Future) Integration with smart-devices & wearables

# Getting Started

There are 2 flavors of Fasten:
- `ghcr.io/fastenhealth/fasten-onprem:sandbox` - This version only allows you to connect to a handful of Healthcare providers, using Sandbox accounts that are meant for testing, and contain synthetic(fake) data to give you an idea what Fasten will look like, without requiring personal medical information.
- `ghcr.io/fastenhealth/fasten-onprem:main` - This version allows you to connect to 25,000+ different Healthcare providers, using your existing accounts. It will allow you to connect and retrieve your personal electronic medical record and store it within Fasten. **Be careful, this is YOUR health data**

## Instructions

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/fastenhealth/fasten-onprem?style=flat-square)](https://github.com/fastenhealth/fasten-onprem/releases/latest)

First, if you don't have Docker installed on your computer, get Docker by following this [install guide](https://docs.docker.com/get-docker/).

Next, run the following commands from the Windows command line or Mac/Linux terminal in order to download and start the Fasten docker container.

```
docker pull ghcr.io/fastenhealth/fasten-onprem:main 

docker run --rm \
-p 9090:8080 \
-v ./db:/opt/fasten/db \
-v ./cache:/opt/fasten/cache \
ghcr.io/fastenhealth/fasten-onprem:main 
```

Next, open a browser to `http://localhost:9090`

At this point you'll be redirected to the login page.

### Logging In

Before you can use the Fasten BETA, you'll need to [Create an Account](http://localhost:9090/web/auth/signup).

It can be as simple as
- **Username:** `testuser`
- **Password:** `testuser`


## Usage

If you're using the `sandbox` version of Fasten, you'll only be able to connect to Sources using test credentials

https://docs.fastenhealth.com/getting-started/sandbox.html#connecting-a-new-source

# FAQ's

See [FAQs](https://docs.fastenhealth.com/faqs.html) for common questions (& answers) regarding Fasten

# Support

Have questions? Need help? Found a bug? [Create an issue](https://github.com/fastenhealth/fasten-onprem/issues/new) and we'll do our best to help you out.
You can also join us on [Discord](https://discord.gg/Bykz6BAN8p) to chat with other Fasten users.

[![Discord Join](https://img.shields.io/discord/1023634406935642223?style=flat-square&logo=discord)](https://discord.gg/Bykz6BAN8p)

# Contributing

[![CI](https://github.com/fastenhealth/fasten-onprem/actions/workflows/ci.yaml/badge.svg)](https://github.com/fastenhealth/fasten-onprem/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/fastenhealth/fasten-onprem/branch/main/graph/badge.svg?token=6O0ZUABEHT&style=flat-square)](https://codecov.io/gh/fastenhealth/fasten-onprem)

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for instructions for how to develop and contribute to the Fasten codebase.

Work your magic and then submit a pull request. We love pull requests!

If you find the documentation lacking, help us out and update this README.md. If you don't have the time to work on Fasten, but found something we should know about, please submit an issue.

# Versioning

We use SemVer for versioning. For the versions available, see the tags on this repository.

# Authors

Jason Kulatunga - Initial Development - @AnalogJ

# Licenses

[![GitHub license](https://img.shields.io/github/license/fastenhealth/fasten-onprem?style=flat-square)](https://github.com/fastenhealth/fasten-onprem/blob/main/LICENSE.md)

# Fundraising & Sponsorships

To ensure Fasten's long-term sustainability, we're exploring some funding options. While we're still deciding a long-term monetization strategy, I'm kicking off with a crowdfunding/fundraising experiment for the first 500 users (including a surprise desktop app):

- [Fasten Self-Hosted Lifetime License - **$200**](https://buy.stripe.com/fZe00deiUexS58Y4gg)

Got questions or want to learn more about our fundraising experiment? [Click here to dive into the details & FAQs](https://docs.fastenhealth.com/FUNDRAISING.html) 

I'd also like to thank the following Corporate Sponsors:

<a href="https://depot.dev/"><img src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/sponsors/depot.png" height="100px" /></a>
<a style="padding-left:5px" href="https://www.macminivault.com/"><img src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/sponsors/macminivault.png" height="100px" /></a>
<a style="padding-left:5px" href="https://www.health-samurai.io/"><img src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/sponsors/health-samurai-logo.png" height="100px" /></a>
<a style="padding-left:5px" href="https://www.browserstack.com/"><img src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/sponsors/browserstack.png" height="100px" /></a>
