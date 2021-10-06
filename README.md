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

1. The build the application locally you must have [node.js installed](https://nodejs.org/en/download/) for the static web application and .NET 6 SDK (Release Candidate 1) for the API.  This can be run Windows (or Windows with WSL), Mac or Linux.  All instructions are based on executing from a bash shell. 

1. See [Setting up a .NET development environment](https://cloud.google.com/dotnet/docs/setup) if you are new to .NET development with Google Cloud.

1. Clone this repository locally.

## Build the Web Application
```bash
cd web/
npm run install
npm run build
```
This outputs the optimized static web application to ../api/wwwroot as the api server actually serves up the static content for simplicity.

During development you can use hot loading with the `development server` to see changes in realtime by executing `npm start`.

## Build API Server
cd api/
dotnet build

## Known Issues

* Use proxy in the `package.json` file to workaround [CORS issues](https://create-react-app.dev/docs/proxying-api-requests-in-development/) when using the development server for react.

* You can't use ASP.NET 6 hot reload with signalR.  You also cannot use a development server proxy with signalR.

## Testing locally

1. Follow the previous [instructions](https://cloud.google.com/dotnet/docs/setup) to setup your local development machine.  Make sure to download a JSON key and save in the root directory of this project as `key.json`.

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
