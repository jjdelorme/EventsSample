# Super simple aspnet 6 web app with react front-end

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), but then trimmed down to bare minimum.  This is served by aspnet 6.

## Requirements
node.js installed

## Build Web
```bash
cd web/
npm run install

npm run build
```
This outputs to ../api/wwwroot as the api server actually serves up the static content for simplicity.

## Build .NET
cd api/
dotnet build

## Known Issues

We use proxy in the package.json file to workaround CORS issues when using the development server for react.

You can't use ASP.NET 6 hot reload with signalR.  You also cannot use development server proxies.

## Testing locally

1. Follow the [instructions](https://cloud.google.com/dotnet/docs/setup) to setup your local development machine.  This includes downloading a JSON key which we'll save in the root of this project as `key.json`.

1. Build the container locally
```bash
docker build -t eventssample:v0 .
```

1. Run the container by setting the environment variable and mounting the local `key.json` into the container (wihtout building that into the container image)
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

### Create a secret

Follow the [Instructions](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#secretmanager-create-secret-gcloud) to create the `EventsConnectionString` secret with your MongoDb connection string. You can do this from the command line (gcloud),  Console or VS Code, but I recommend the later 2 as there are a few steps; (1) create the secret, (2) create the version, etc...

### Deploy to Cloud Run

Execute these commands from the root directory of the project.

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