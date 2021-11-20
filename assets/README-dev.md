# Working Locally
To really dive into the demo, you'll want to review the code, build and deploy it locally.  Running the application locally will still connect to your Google Cloud project for cloud services such as Pub/Sub, Firestore, Identity, etc...

All instructions in this README are based on a bash _like_ shell on Mac, Linux or WSL (Windows).  

## Prerequisites
1. See [Setting up a .NET development environment](https://cloud.google.com/dotnet/docs/setup) if you are new to .NET development with Google Cloud for additional instructions on how to setup the Google Cloud SDK with credentials so that you can securely access GCP cloud services from the application locally.
    * For the purposes of this demo, store your downloaded key in the *project's root* directory as `./key.json` and set your environment variable: `export GOOGLE_APPLICATION_CREDENTIALS=$PWD/key.json`

1. You must have [node.js installed](https://nodejs.org/en/download/) and [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0).  

## Build
1. Build the web application
    ```bash
    # From ./web directory
    npm run install
    npm run build
    ```
    This outputs the optimized static web application to `../api/wwwroot`.  The API serves the static content with `UseStaticFiles()`.

1. Build the API Server
    ```bash
    # From ./api directory
    dotnet build
    ```

## Run
1. Tp start the server listening on port 5000 run `dotnet run` from the `./api` directory

1. Launch your browser: [http://localhost:5000](http://localhost:5000)

## Developing with Hot Reload
During development you can hot reload the static React HTML/JS/CSS content using the node.js `development server` by running `npm start`.  This will launch a separate process to serve the web client application on a different port and dynamically rebuild/reload the static content on change.  The application will then be hosted on 2 different ports:

* Port **3000** will serve the static content using node.js
* Port **5000** will serve the API, but it will be proxied through port 3000 (see below).

The `proxy` field in `package.json` works around [CORS issues](https://create-react-app.dev/docs/proxying-api-requests-in-development/) when using the *development server for react* (`npm start`).

Launch your browser with [http://localhost:3000](http://localhost:3000).  Each time you change the static React application, your changes will automatically appear.

If you launch the api server with `dotnet watch` from `./api` directory (_instead_ of `dotnet run`) you will see the new [ASP.NET 6 support for hot reloading](https://devblogs.microsoft.com/dotnet/introducing-net-hot-reload/) which will allow you to make some C# code changes without manually recompiling.

### WARNING: Hot reload with signalR
You cannot use a *development server* proxy with signalR. This means that notifications will not work when running through the development server locally.  To test end-to-end locally, run `npm run build` in the `web` directory and then run the api with `dotnet run` in the `api` directory for the ASP.NET server to serve static content instead of the development server.  There are also issues running signalR with `dotnet watch`, so you cannot use hot reload to test any changes with signalR notifications on the server or client.

## Building and Running in a Container

The application will run in a container when deployed to Cloud Run.  When running in Cloud Run the container will have implicit access to Google credentials.  

When running elsewhere (i.e. locally), you will need to provide Google credentials for the backend services it accesses.  Follow these steps for one way of providing these credentials.

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

At this stage you could tag and push this container directly to a Google Artifact Registry and point Cloud Run to it.

For this sample we're going to leverage the [deploying from source](https://cloud.google.com/run/docs/deploying-source-code) capability in Cloud Run which leverages Cloud Build behind the scenes to automatically build and deploy the container.

## Deployment

Complete build of the application, container image and deploy typically takes 7-8 minutes, but to be safe just set the timeout to 15 minutes to avoid possibility of timeout failure.  This could be significantly optimized by parallelizing the web and api builds, but instead it has been optimized for simplicity.
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

