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
The client application _can be configured_ to use `Sign in with Google` to authenticate end-users and restrict edits to only authenticated users.  The backing APIs are secured using built-in ASP.NET authorization.  More details are in a separate [README](./assets/README-auth.md).

## Deploying to Google Cloud

It is recommended that you create a new Google Cloud project.  You have a choice of working locally or in the [Google Cloud Shell](https://console.cloud.google.com/home/dashboard?cloudshell=true). If you want to edit the code, build and test it is recommended that you do that locally.

The install script in this repository will enable the approprate service apis, create a separate [service account](https://cloud.google.com/iam/docs/service-accounts) to run the application and assign necessary permissions within your Google Cloud project.  

The script also assigns the appropriate permissions for the built-in Google Cloud Build service account so that it can demonstrate using Google Cloud Build to automatically build and deploy the application.

1. Clone the repository

1. Execute the following commands
```bash
# ... After Cloning into 'EventsSample'...
cd ./EventsSample

# Enables required services & permissions in your project.
./install.sh

# Builds and deploys to cloud run
gcloud builds submit --timeout=15m
```
## Next steps
* [Read on](./assets/README-dev.md) to dive into the code, build, test and deploy locally.
* [README-auth.md](./assets/README-auth.md) descrbies how end user and api authentication and authorization are implemented.
* [Architecture](./assets/README-architecture.md)
