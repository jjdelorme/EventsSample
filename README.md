# Events Sample

Demonstrates an ASP.NET application that serves a static React single page application which can view, edit, delete data stored in a Mongo database.  The application publishes events to a Google PubSub topic while also separately subscribing to the topic to deliver realtime notifications using ASP.NET SignalR.

## Technologies Demonstrated

* React bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and the [Material UI library](https://mui.com/)
* ASP.NET 6 (Release Candidate 1) with [Minimal API](https://www.hanselman.com/blog/exploring-a-minimal-web-api-with-aspnet-core-6)
* ASP.NET SignalR
* MongoDB [.NET client](https://docs.microsoft.com/en-us/aspnet/core/tutorials/first-mongo-app?view=aspnetcore-6.0&tabs=visual-studio-code)
* Google PubSub
* Google Cloud Run 
* Google Secret Manager
* Google Cloud Build

## Prerequisites

1. To build the web application locally you must have [node.js installed](https://nodejs.org/en/download/) and .NET 6 SDK (Release Candidate 1) for the API.  This can be run Windows (Windows with WSL), Mac or Linux.  All instructions are based on a bash like shell. 

1. See [Setting up a .NET development environment](https://cloud.google.com/dotnet/docs/setup) if you are new to .NET development with Google Cloud.

1. Clone this repository locally.

## Required configuration
1. For events persistance a MongoDb database `ConnectionString` must be populated in appsettings 

1. For JWT token signing to enable authorization of the API calls a Public (`PublicKeyPemFile`) / Private (`PublicKeyPemFile`) key pair must be created in `.pem` format, if the location or filenames differ, change this in appsettings.  See this for [creating rsa keys](https://www.scottbrady91.com/openssl/creating-rsa-keys-using-openssl).

1. To enable Google authentication a `GoogleClientId` must be created and stored in appsettings.  The Google client ID is created using the [Google developer console](https://console.developers.google.com/).  Choose `Web Application` and add `http://localhost:5000` as an *Authorized JavaScript origins*.

1. The Google client ID must be embedded into the client side code at build time.  To enable this set the `REACT_APP_GOOGLE_CLIENTID` environment variable prior to building the web application.

### 

## Build the API Server
cd api/
dotnet build

## Build the Web Application
```bash
cd web/
npm run install
npm run build
```
This outputs the optimized static web application to `../api/wwwroot`.  The API serves the static content for simplicity with `UseStaticFiles()` using the default directory.

## Developing locally

1. Follow the previous [instructions](https://cloud.google.com/dotnet/docs/setup) to setup your local development machine.  Make sure to download a JSON key and save in the root directory of this project as `key.json`.

To start the API server run `dotnet run` from the `\api` directory.

During development you can hot reload the static React HTML/JS/CSS content using the `development server` by running `npm start`.  When using the node.js development server the application will be hosted on 2 different ports:

* Port **3000** will serve the static content using node.js
* Port **5000** will serve the API, but it will be proxied through port 3000 (see below).

## Known Issues

* Use the `proxy` field in `package.json` to workaround [CORS issues](https://create-react-app.dev/docs/proxying-api-requests-in-development/) when using the *development server for react* (`npm start`).

* HOWEVER, you cannot use a *development server* proxy with signalR, which means that notifications will not work when running through the development server locally.  To test end-to-end locally, run `npm run build` in the `web` directory and then run the api with `dotnet run` in the `api` directory for the ASP.NET server to serve static content instead of the development server.

* Also note that you cannot use ASP.NET 6 hot reloading (`dotnet watch`) with signalR.

## Building and running in a container locally

The application will run in a container when deployed to Cloud Run.  

1. Build the container locally
    ```bash
    docker build -t eventssample:v0 .
    ```

1. Run the container by setting the environment variable and mounting the local `key.json` into the container (without copying it into the container image)
    ```bash
    PROJECT_ID=`gcloud config list --format 'value(core.project)' 2>/dev/null`

    # Enter your connection string here:
    CONNECTION_STRING=''

    docker run -it -p 8080:8080 -v $PWD:/key \
        -e GOOGLE_APPLICATION_CREDENTIALS=/key/key.json \
        -e ProjectId=$PROJECT_ID \
        -e ConnectionString=$CONNECTION_STRING \
        eventssample:v0
    ```    

At this stage you could deploy this container directly to a Google Artifact Registry and point Cloud Run to it, but for this sample we're going to leverage the [deploying from source](https://cloud.google.com/run/docs/deploying-source-code) capability in Cloud Run which leverages Cloud Build behind the scenes to automatically build and deploy the container.

## Deployment

Follow these steps to store the connection string in Google Secret Manager and deploy to Cloud Run using Cloud Build.

### Create a secret

Follow the [Instructions](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#secretmanager-create-secret-gcloud) to create the `EventsConnectionString` secret with your MongoDb connection string. You can do this from the command line (gcloud),  Console or VS Code, but I recommend the later 2 as there are a few steps; (1) create the secret, (2) create the version, etc...

### Deploy to Cloud Run

Execute these commands from the root directory of the project:

```bash
PROJECT_ID=`gcloud config list --format 'value(core.project)' 2>/dev/null`

gcloud beta run deploy \
--region us-central1 \
--platform managed \
--allow-unauthenticated \
--update-env-vars ProjectId=$PROJECT_ID \
--update-secrets=ConnectionString=EventsConnectionString:latest \
--source . \
eventssample
```
