# Super simple aspnet 6 web app with react front-end

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), but then trimmed down to bare minimum.  This is served by aspnet 6.

## Requirements
node.js installed

## Build Web
cd web/
npm run install

npm run build
This outputs to ../api/wwwroot as the api server actually serves up the static content for simplicity.

## Build .NET
cd api/
dotnet build

## Known Issues

We use proxy in the package.json file to workaround CORS issues when using the development server for react.

You can't use ASP.NET 6 hot reload with signalR.  You also cannot use development server proxies.