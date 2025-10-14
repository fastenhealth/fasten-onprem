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

> [!IMPORTANT]  
> **This repository contains the open-source, self-hosted [Personal Health Record](https://en.wikipedia.org/wiki/Personal_health_record) app. It is maintained by the community and is not the same product as [Fasten Connect](https://www.fastenhealth.com/).**
>
> Fasten Connect is our fully-managed, enterprise-grade API platform designed for organizations who need seamless, scalable access to patient-authorized medical records (e.g., for clinical trials, patient recruitment, or research). If you're looking for business support, SLAs, and out-of-the-box integrations, [click here to learn more about Fasten Connect](https://www.fastenhealth.com/).
>
> While we welcome contributions and discussion here, **this open-source repo does not include any of the hosted infrastructure, support services, or commercial features available through Fasten Connect**.

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

So, I built it.

**Fasten is an open-source, self-hosted, personal/family electronic medical record aggregator, designed to integrate with 1000's of insurances/hospitals/clinics**

# Features

It's pretty basic right now, but it's designed with a easily extensible core around a solid foundation:

- Self-hosted
- Designed for families, not Clinics (unlike OpenEMR and other popular EMR systems)
- Supports the Medical industry's (semi-standard) FHIR protocol
- Uses OAuth2 (Smart-on-FHIR) authentication (no passwords necessary)
- Uses OAuth's `offline_access` scope (where possible) to automatically pull changes/updates
- (Future) Multi-user support for household/family use
- Condition specific user Dashboards & tracking for diagnostic tests
- (Future) Vaccination & condition specific recommendations using NIH/WHO clinical care guidelines (HEDIS/CQL)
- (Future) ChatGPT-style interface to query your own medical history (offline)
- (Future) Integration with smart-devices & wearables

# Getting Started

There are 2 flavors of Fasten:
- `ghcr.io/fastenhealth/fasten-onprem:sandbox` - This version only allows you to connect to a handful of Healthcare providers, using Sandbox accounts that are meant for testing, and contain synthetic (fake) data to give you an idea what Fasten will look like, without requiring personal medical information.
- `ghcr.io/fastenhealth/fasten-onprem:main` - This version allows you to connect to 25,000+ different Healthcare providers, using your existing accounts. It will allow you to connect and retrieve your personal electronic medical record and store it within Fasten. **Be careful, this is YOUR health data**

---

## Instructions

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/fastenhealth/fasten-onprem?style=flat-square)](https://github.com/fastenhealth/fasten-onprem/releases/latest)

First, if you don't have Docker installed on your computer, get Docker by following this [install guide](https://docs.docker.com/get-docker/).

Next, run the following commands from the Windows command line or Mac/Linux terminal in order to download and start the Fasten docker container.



### 🚀 Launch

Launch the application. Please choose a location where `docker-compose.yml` and `set_env.sh` will be downloaded.

To make your Fasten instance discoverable by companion mobile apps and other devices on your local network, you need to run the `set_env.sh` script before starting Docker Compose. This script sets the necessary `HOSTNAME` and `IP` values in a `.env` file, which is required for syncing.

Here are the step-by-step instructions:

1.  **Download necessary files:**
    ```bash
    curl https://raw.githubusercontent.com/fastenhealth/fasten-onprem/refs/heads/main/docker-compose-prod.yml -o docker-compose.yml
    curl https://raw.githubusercontent.com/fastenhealth/fasten-onprem/refs/heads/main/set_env.sh -o set_env.sh
    ```

2.  **Prepare and run the environment setup script:**
    Make the script executable and run it to generate your `.env` file. This will configure network variables required for Docker Compose.
    ```bash
    chmod +x ./set_env.sh
    ./set_env.sh
    ```

3.  **Start the application:**
    ```bash
    docker compose up -d
    ```

**Manual Configuration (Optional)**

If you prefer not to run the `set_env.sh` script, you can configure the `.env` file manually. You will need to create a `.env` file and add the following variables:

1.  **Find your hostname:**
    ```bash
    hostname
    ```
2.  **Find your local IP address:**
    *   **macOS:** `ifconfig | grep "inet " | grep -v 127.0.0.1 | cut -d' ' -f2`
    *   **Linux:** `hostname -I | awk '{print $1}'`
    *   **Windows (Command Prompt):** `ipconfig | findstr /i "ipv4"`

3.  **Create and edit the `.env` file:**
    Create a file named `.env` in the same directory as your `docker-compose.yml` and add the following lines, replacing `<your_hostname>` and `<your_ip_address>` with the values you found:
    ```
    HOSTNAME=<your_hostname>
    IP=<your_ip_address>
    PORT=9090
    ```

Next, open a browser to `https://localhost:9090`

### <a name="using-https"></a>🔒 Using HTTPS and Trusting the Self-Signed Certificate

By default, Fasten On-Prem runs with HTTPS enabled to ensure your data is secure. It uses a self-signed **TLS** certificate, which offers the same level of encryption as a commercially issued certificate. The first time you connect, your browser will display a security warning because it doesn't yet trust the certificate's issuer. The steps below will guide you through the simple, one-time process of telling your browser to trust the certificate, ensuring a secure connection without future warnings. Please note that the generated certificates can be replaced at any time with your own valid TLS certificates.

#### How it Works: The Chain of Trust

To establish a secure connection, your browser needs to trust the server's TLS certificate. Here’s how the process works in Fasten On-Prem:

1.  **Root Certificate Authority (CA):** When the application first starts, it generates its own self-contained Certificate Authority, called `"Fasten Health CA"`. Think of this as the highest level of trust. The public part of this CA is the `rootCA.pem` file.
2.  **Server Certificate:** The application then uses the `"Fasten Health CA"` to issue and sign a specific certificate for the web server (e.g., for `localhost`).
3.  **Browser Verification:** When you connect to the server, it presents the server certificate to your browser. Your browser checks who signed it and sees it was `"Fasten Health CA"`. The browser then asks, "Do I trust the 'Fasten Health CA'?"

Initially, the answer is no, which is why you see a security warning. By following the steps below to import the `rootCA.pem` file, you are telling your browser or operating system to trust our self-generated CA. Once the CA is trusted, any certificates it signs—including the server certificate—will also be trusted, and the connection will be secure without any warnings.

#### 1. Locate the Root CA Certificate

When you run the application using the production Docker Compose file (`docker-compose-prod.yml`), it automatically generates a `rootCA.pem` file. This file is located in the `certs` directory on your host machine.

-   **Certificate Path:** `certs/rootCA.pem`

#### 2. Import the Certificate

You will need to import this certificate into your operating system's or browser's trust store. Here are general instructions for different platforms:

**macOS**

1.  Open the **Keychain Access** application.
2.  Select the **System** keychain.
3.  Go to **File > Import Items** and select the `certs/rootCA.pem` file.
4.  Find the "Fasten Health CA" certificate in the list, double-click it, and under the **Trust** section, set "When using this certificate" to **Always Trust**.

**Windows**

1.  Double-click the `certs/rootCA.pem` file.
2.  Click **Install Certificate...** and choose **Local Machine**.
3.  Select **Place all certificates in the following store**, click **Browse**, and choose **Trusted Root Certification Authorities**.
4.  Complete the wizard to finish the import process.

**Linux (Ubuntu/Debian)**

1.  Copy the certificate to the trusted certificates directory:
    ```bash
    sudo cp certs/rootCA.pem /usr/local/share/ca-certificates/fasten-health-ca.crt
    ```
2.  Update the system's certificate store:
    ```bash
    sudo update-ca-certificates
    ```

**Firefox**

Firefox has its own trust store. To import the certificate:

1.  Go to **Settings > Privacy & Security**.
2.  Scroll down to **Certificates** and click **View Certificates...**.
3.  In the **Authorities** tab, click **Import...** and select the `certs/rootCA.pem` file.
4.  Check the box for **Trust this CA to identify websites** and click **OK**.

### 🧪 Develop

Use local development settings for testing and iteration. 

```bash
docker compose up -d
```

*Optional:*

```bash
make serve-docker
```

ℹ️ Requires a local clone of the repository.

> ⚠️ **Warning:** Do not run both `docker compose up -d` / `(make serve-docker)` simultaneously. Choose one based on your deployment scenario.

### Optional

```
docker pull ghcr.io/fastenhealth/fasten-onprem:main

docker run --rm \
-p 9090:8080 \
-v ./db:/opt/fasten/db \
-v ./cache:/opt/fasten/cache \
ghcr.io/fastenhealth/fasten-onprem:main
```

At this point you'll be redirected to the login page.

### Logging In

Before you can use the Fasten BETA, you'll need to [Create an Account](https://localhost:9090/web/auth/signup).

It can be as simple as
- **Username:** `testuser`
- **Password:** `testuser`


## Usage

If you're using the `sandbox` version of Fasten, you'll only be able to connect to Sources using test credentials

https://docs.fastenhealth.com/getting-started/sandbox.html#connecting-a-new-source

## Using with multiple people

> [!NOTE]
> NOTE: Multi-user features are a work in progress. This section describes the eventual goals.

Fasten is designd to work well for an individual or a family. Since it is self-hosted, by nature the person running the service will have full root access to all user records. For most families, this is perfect! If you need stronger security, Fasten might not be for you.

Fasten assumes that all records connected from a single user account (from one or more sources) belong to a single individual, and thus will show aggregations that will only make sense for a single person. Be careful to not connect sources for different people to the same Fasten user account.

Tracking health data for multiple family members works by creating new user accounts for each person. Any user with the `admin` role can manage users and permissions. Any user can be granted access (by an admin) to view another user's records. Through this mechanism, it's easy to setup any family configuration needed. For example: a family of four can have two parents that can each see the records of the two children.

It is also possible to create users with the `viewer` role that only have access to view records of other users. This can be used to share records with a caregiver.

This allows for a more complex example:

- a family consisting of 2 parents, and 2 children and a caregiver (nurse, babysitter, grandparent).
- both parents need to be able to access both children's records, and maybe each-others
- the caregiver should have view-only access to 1 or both children, but not the parents.


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

This project is tested with BrowserStack.

# Versioning

We use SemVer for versioning. For the versions available, see the tags on this repository.

# Authors

- Jason Kulatunga - Initial Development - @AnalogJ
- Alex Szilagyi - Co-Author - @alexszilagyi

# Licenses

[![GitHub license](https://img.shields.io/github/license/fastenhealth/fasten-onprem?style=flat-square)](https://github.com/fastenhealth/fasten-onprem/blob/main/LICENSE.md)

# Fundraising & Sponsorships

We'd like to thank the following Corporate Sponsors:

<a href="https://depot.dev/"><img src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/sponsors/depot.png" height="100px" /></a>
<a style="padding-left:5px" href="https://www.macminivault.com/"><img src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/sponsors/macminivault.png" height="100px" /></a>
<a style="padding-left:5px" href="https://www.browserstack.com/"><img src="https://raw.githubusercontent.com/fastenhealth/docs/main/img/sponsors/browserstack.png" height="100px" /></a>
