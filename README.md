# Events Sample

Demonstrates a complete, yet simple ASP.NET application deployed to [Google Cloud Run](https://cloud.google.com/run/docs/) that enables viewing, editing and receiving notifcations for data persisted with NoSQL in [Google Firestore](https://cloud.google.com/firestore#section-4) or a Mongo database.  The server publishes events to a [Google PubSub](https://cloud.google.com/pubsub#section-5) topic while separately subscribing to the topic so that realtime notifications will be delivered using [ASP.NET SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr) over a websocket connection from the server back to the client.

## Overview
### Technologies Demonstrated

* ASP.NET 6 with Minimal API
* [Create React App](https://github.com/facebook/create-react-app) with the [Material UI library](https://mui.com/)
* Google Cloud Run
* Google Firestore
* Google PubSub
* Google Secret Manager 
* Google Cloud Build
* Google Cloud Operations with [structured logging](https://cloud.google.com/logging/docs/structured-logging)
* Google Identity Services
* ASP.NET SignalR
* (Optional) MongoDB [.NET client](https://docs.microsoft.com/en-us/aspnet/core/tutorials/first-mongo-app?view=aspnetcore-6.0&tabs=visual-studio-code) 

### Client
The client side web application is built as a Single Page Application (SPA) using [ReactJS](https://reactjs.org) and is bootstrapped with [`create-react-app`](https://create-react-app.dev/) which bundles all html/javascript/css as static content into the `wwwroot` folder of the server at build time.  The client application is completely static and runs entirely in the browser, making service calls to the backend apis using javascript [`fetch(...)`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).  

For simplicity this static content is served by the backend server, but this is not a requirement and there is absolutely no coupling.  You could [host the static website in a Cloud Storage bucket](https://cloud.google.com/storage/docs/hosting-static-website), but SSL must be configured as well as [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

### Server

The server application is implemented with C# using ASP.NET 6.  The server exposes REST APIs with ASP.NET `Controller`s, hosts ASP.NET SignalR as a service with `AddSignalR()`, serves the static web application with `UseStaticFiles()` and takes advantage of the new [ASP.NET 6 minimal API](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-6.0).  The server is built and published as a [self contained](https://docs.microsoft.com/en-us/dotnet/core/deploying/), [single file](https://docs.microsoft.com/en-us/dotnet/core/deploying/single-file) binary for Linux which uses the built in [Kestrel web server for ASP.NET](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-6.0).  The server is packaged in a minimal linux container using the [Official .NET Runtime Dependencies Docker image](https://hub.docker.com/_/microsoft-dotnet-runtime-deps/).

### Client/Server Authentication
The client application uses `Sign in with Google` to authenticate end-users and restricts edits to only authenticated users.  The backing APIs are secured using built-in ASP.NET authorization.  More details are in a separate [README](./README-auth.md).

## Deploying to Google Cloud

It is recommended that you create a new Google Cloud project.  You have a choice of working locally or in the [Google Cloud Shell](https://console.cloud.google.com/home/dashboard?cloudshell=true). If you want to edit the code, build and test it is recommended that you do that locally.

The install script in this repository will enable the approprate service apis, create a separate [service account](https://cloud.google.com/iam/docs/service-accounts) to run the application and assign necessary permissions within your Google Cloud project.  

The script also assigns the appropriate permissions for the built-in Google Cloud Build service account so that it can demonstrate using Google Cloud Build to automatically build and deploy the application.

1. Clone this repository

1. Run `./install.sh` from the project root directory

### To build the application locally [OPTIONAL]
For the purposes of this demonstration this should all be run on Mac, Linux or WSL (if on Windows).  All instructions in this README are based on a bash _like_ shell.  Building and running the application locally will still connect to a Google Cloud for the demonstrated cloud services such as Pub/Sub, Firestore, Identity, etc...

1. See [Setting up a .NET development environment](https://cloud.google.com/dotnet/docs/setup) if you are new to .NET development with Google Cloud for additional instructions on how to setup the Google Cloud SDK with credentials so that you can securely access GCP cloud services from the application locally.
    * For the purposes of this demo, store your downloaded key in the *project's root* directory as `./key.json` and set your environment variable: `export GOOGLE_APPLICATION_CREDENTIALS=$PWD/key.json`

1. To build the web application _locally_ you must have [node.js installed](https://nodejs.org/en/download/) and [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0).  

1. Build the web application
    ```bash
    # From ./web directory
    npm run install
    npm run build
    ```
    This outputs the optimized static web application to `../api/wwwroot`.  The API serves the static content for simplicity with `UseStaticFiles()` using the default directory.

1. Build the API Server
    ```bash
    # From ./api directory
    dotnet build
    ```

### Running locally [OPTIONAL]
1. Follow the previous step's [instructions](https://cloud.google.com/dotnet/docs/setup) to setup your local development machine including creating a service account,downloading a JSON key as assigning the path to in the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

1. Start the server run `dotnet run` from the `./api` directory which will start listening on port 5000.

1. Launch your browser: [http://localhost:5000](http://localhost:5000)

## Developing Locally with hot reload
During development you can hot reload the static React HTML/JS/CSS content using the `development server` by running `npm start`.  This will use the node.js development server to serve the web client application and NOT the api server.  The application will be hosted on 2 different ports:

* Port **3000** will serve the static content using node.js
* Port **5000** will serve the API, but it will be proxied through port 3000 (see below).

The `proxy` field in `package.json` works around [CORS issues](https://create-react-app.dev/docs/proxying-api-requests-in-development/) when using the *development server for react* (`npm start`).

Launch your browser with [http://localhost:3000](http://localhost:3000).  Each time you change the static React application, your changes will automatically appear.

If you launch the api server with `dotnet watch` from `./api` directory (_instead_ of `dotnet run`) you will see the new [ASP.NET 6 support for hot reloading](https://devblogs.microsoft.com/dotnet/introducing-net-hot-reload/).  

### NOTE: Local development & hot reload with signalR
You cannot use a *development server* proxy with signalR. This means that notifications will not work when running through the development server locally.  To test end-to-end locally, run `npm run build` in the `web` directory and then run the api with `dotnet run` in the `api` directory for the ASP.NET server to serve static content instead of the development server.  There are also issues running signalR with `dotnet watch`, so you cannot use hot reload to test any changes with signalR notifications on the server or client.

## Building and running in a container locally

The application will run in a container when deployed to Cloud Run.  

1. Build the container locally
    ```bash
    docker build -t eventssample:v0 .
    ```

1. Run the container by setting the container's `GOOGLE_APPLICATION_CREDENTIALS` environment variable and _mounting_ your json file into the container rather than copying it into the container image (that would be a bad practice).  For the purposes of this demonstration, we've named the file `key.json`.  If this is not what you have named your file, you will need to change it below.
    ```bash
    # Load the current project from gcloud where your cloud services are deployed
    PROJECT_ID=`gcloud config list --format 'value(core.project)' 2>/dev/null`

    docker run -it -p 8080:8080 \
        -v $PWD:/key \
        -e GOOGLE_APPLICATION_CREDENTIALS=/key/key.json \
        -e ProjectId=$PROJECT_ID \
        eventssample:v0
    ```    

At this stage you could deploy this container directly to a Google Artifact Registry and point Cloud Run to it, but for this sample we're going to leverage the [deploying from source](https://cloud.google.com/run/docs/deploying-source-code) capability in Cloud Run which leverages Cloud Build behind the scenes to automatically build and deploy the container.

## Deployment

Build and deploy the application with Google Cloud Build by executing this single command from the project root directory.  Complete build of the application, container image and deploy typically takes 7-8 minutes, but to be safe just set the timeout to 15 minutes to avoid possibility of timeout failure.  This could be significantly optimized by parallelizing the web and api builds, but instead it has been optimized for simplicity.
```bash
# Run from ./
gcloud builds submit --timeout=15m
```

Cloud Build will bundle up the directory, store it in a secure Cloud Storage bucket and kick off a build agent.  The build agent by default will look for a `cloudbuild.yaml` file as defined in the root of this project.  

## Switching to MongoDb
A MongoDb instance is not included in this sample, however you can follow [these instructions](https://www.mongodb.com/cloud/atlas/mongodb-google-cloud) to leverage MongoDb Atlas on Google Cloud or deploy as a [standalone container on a Kuberenetes cluster](https://docs.mongodb.com/kubernetes-operator/master/tutorial/deploy-standalone/) like [GKE Autopilot](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-an-autopilot-cluster).

1. [Create a Google Cloud Secret](https://cloud.google.com/sdk/gcloud/reference/secrets/create) named `MongoDb__ConnectionString` with your MongoDb connection string, e.g. `mongodb://myroot:mypassword@100.2.3.4:27017` 

1. Update `./api/Program.cs`:
    ```diff
    - builder.Services.AddSingleton<IRepository, FirestoreRepository>();
    + builder.Services.AddSingleton<IRepository, MongoDbRepository>();
    ```

1. Build and deploy the application again as [above](#Deployment) and it will deploy a new revision.

