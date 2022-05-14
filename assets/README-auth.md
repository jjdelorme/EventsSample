# Authentication & Authorization

## Overview
The application can be configured to use [Google Identity](https://developers.google.com/identity/gsi/web/guides/overview) to provide `Sign in with Google` authentication.  **By default this is not enabled**.

## Prerequisites
1. You must first [get your Google API client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) to get an OAuth client ID which we'll call _GoogleClientId_.  

1. Enable `Authentication` and add the OAuthIsAdmin client ID in `appsettings.json`
    ```json
    "Authentication": {
        "Enabled": true,
        "GoogleClientId": "your-oauth-id"
    }
    ```

1. Set the appropriate `Authorized JavaScript origins`.  To test locally (recommended), add `http://localhost:5000` to the list of origins.  If you have already deployed to Cloud Run add your fully qualified Cloud Run origin i.e. `https://eventssample-XXXXXXXX-uc.a.run.app`.  You can get this by running:
    ```bash
    gcloud config set run/region us-central1
    gcloud run services describe eventssample --format="value(status.address.url)"
    ```
1. Rebuild and redeploy the application to reflect the updated configuration with `gcloud builds submit`.  

1. Alternatively, you do not actually need to rebuild the application, you could just redeploy without rebuilding:
    ```bash
    # Replace with your GoogleClientId
    CLIENT_ID=xxx.apps.googleusercontent.com

    PROJECT_ID=`gcloud config list --format 'value(core.project)' 2>/dev/null`

    IMAGE=`gcloud run services describe eventssample --format 'value(spec.template.spec.containers[0].image)' 2>/dev/null`

    gcloud run deploy \
        --platform managed \
        --allow-unauthenticated \
        --set-env-vars Authentication__Enabled=true \
        --set-env-vars Authentication__GoogleClientId=$CLIENT_ID \
        --set-env-vars ProjectId=$PROJECT_ID \
        --set-secrets=/app/keys/public/public-key.pem=JwtPublicKey:latest,/app/keys/private/private-key.pem=JwtPrivateKey:latest \
        --service-account="eventssample-sa@$PROJECT_ID.iam.gserviceaccount.com" \
        --image $IMAGE \
        eventssample
    ```

## How it works
1. The client requests the `GoogleClientId` from the server using `/user/clientid` (this id is not a secret).

1. The client uses the `react-google-login` component with `GoogleClientId` to pop-up an official Google login dialog.  Upon successful signin an `Id Token` will be returned from Google Identity.

1. The client will exchange the `Id Token` for an `Access Token` by posting it to `/user/authenticate`. The authentication controller will verify that the Id Token is valid and issue it's own signed JWT token that will be used by all subsequent client side api calls to the server.  

### ASP.NET Authentication & Authorization
The application leverages built in ASP.NET Authentication & Authorization.  You will find certain controller actions annotated as below indicating that only authenticated users who have the admin role can execute these methods.

```csharp
        [Authorize(Roles = AuthenticationSettings.AdminRole)]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody]User user)
        ...
```

### Authentication Configuration
To enable authentication and authorization edit your `appsettings.json` file.  You will need to set `Enabled` to *true* and populate the `GoogleClientId` with your specific id.  

```json
    },
    "Authentication": {
      "Enabled": true,
      "PublicKeyPemFile": "keys/public/public-key.pem",
      "PrivateKeyPemFile": "keys/private/private-key.pem",
      "ValidIssuer": "EventsSample",
      "ValidAudience": "eventsApi",        
      "GoogleClientId": "XXXXXXXXXXXXXXXXXXXXXXXXXx.apps.googleusercontent.com"
    } 
```

For JWT token signing to enable authorization of the API calls a Public (`PublicKeyPemFile`) / Private (`PublicKeyPemFile`) key pair must be created in `.pem` format.  Running `./install.sh` will take care of this for you.  If you want more information, see this for [creating rsa keys](https://www.scottbrady91.com/openssl/creating-rsa-keys-using-openssl).

### Creating the first Admin
Test easiest way to create yourself as the first user with the Admin role is to modify the unit test in `./api.Tests/FirestoreRepositoryTests.cs`.  In the constructor a test user is created.  Change this user to your valid google (i.e. gmail) email address.  When you login using Google for the first time, you will be the admin and will be able to create other users.

```csharp
        _testUser = new User
        {
            Email = "test@test.com",  // <-- replace with your Google account.
            ...
        }

```

After you modify the code, run `dotnet test` from the `./api.Tests/` directory.