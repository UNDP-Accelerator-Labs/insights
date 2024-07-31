# Accelerator Lab Insights Hub

Discover curated blogs and articles fostering collaboration, innovation, and continuous learning across the Accelerator Lab networks with the UNDP Insights Hub. 


## Prerequisites

Before setting up the code locally, ensure you have the following prerequisites installed:

- Node.js: Make sure you have Node.js installed. You can check your version by running `node --version`.

## Setup

To set up the application locally, follow these steps:

1. Clone the repository: `git clone https://github.com/UNDP-Accelerator-Labs/insights.git`
2. Install dependencies: Run `npm install` or `yarn install` in the project root directory.

4. Create `.env` file: Create a `.env` file in the project root directory and add the following environment variables:
    ```dotenv
    DB_USER=''
    DB_HOST=''
    DB_NAME=''
    DB_PASS=''
    DB_PORT=''
    production=

    L_DB_USER=''
    L_DB_HOST=''
    L_DB_NAME=''
    L_DB_PASS=''

    LOGIN_DB_NAME=''
    LOGIN_DB_PORT=''
    LOGIN_DB_HOST=''
    LOGIN_DB_USERNAME=''
    LOGIN_DB_PASSWORD=''

    NODE_ENV='local'

    NLP_API_URL = ""
    API_TOKEN = ''
    APP_SECRET=''
    ```
5. Start the application: Run `npm start` to start the application.


## Create docker image locally

Run
```
make -s build
```
to build the docker image.
Use `make -s git-check` to verify that the current working copy is clean and
that no unwanted (or uncommit) files will be included in the image.

## Push docker image

Make sure to log in to azure via `make azlogin`.

Run
```
make -s build
make -s dockerpush
```
to build the image and push it to azure. Make sure to update the image in the
Deployment Center. This is only if you need to test non major version changes.
For proper deployment use the deploy functionality as described below.

## Deploying new version

Make sure to be on the master branch with a clean working copy.

Run
```
make -s deploy
```

### Monitoring usage

As of 2024-07-31, we have added a simple pageviews counter. We chose [Goat Counter](https://www.goatcounter.com) because it's completely open source, independent, and free for small sites. Usage statistics are visible here: https://sdg-innovation-commons.goatcounter.com/. 