# Authentication & Authorization

## Overview
The application uses [Google Identity](https://developers.google.com/identity/gsi/web/guides/overview) to provide `Sign in with Google` authentication.  The client side will recieve an `Id Token` from Google Identity which it will exchange for an `Access Token` by calling the `/user/authenticate` controller action which will issue a JWT token that will be used by all subsequent client side api calls to the server.  

By using the provided hard coded `GoogleClientId` you will be able to authenticate when using the default localhost:5000 as the api server, but if you change ports or host elsewhere, you will need to follow the [guide](https://developers.google.com/identity/gsi/web/guides/overview) to create your own Google Client Id and set the appropriate `Authorized JavaScript origins`.

## Configuration
1. For JWT token signing to enable authorization of the API calls a Public (`PublicKeyPemFile`) / Private (`PublicKeyPemFile`) key pair must be created in `.pem` format, if the location or filenames differ, change this in appsettings.  See this for [creating rsa keys](https://www.scottbrady91.com/openssl/creating-rsa-keys-using-openssl).

1. To enable Google authentication a `GoogleClientId` must be created and stored in appsettings.  The Google client ID is created using the [Google developer console](https://console.developers.google.com/).  Choose `Web Application` and add `http://localhost:5000` as an *Authorized JavaScript origins*.

1. The Google client ID must be embedded into the client side code at build time.  This is currently hard coded as `GoogleClientId` found in `./web/src/login.js`.
