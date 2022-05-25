# Authentication & Authorization

## Overview
The application can be configured to use [Google Identity](https://developers.google.com/identity/gsi/web/guides/overview) to provide `Sign in with Google` authentication.  **By default this is not enabled**.

This implementation leverages [Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/overview) for user authentication, but authorization is handled by our api.  This allows us to offer granular access control with application defined roles and also decouples authentication from authorization. 

## Prerequisites
1. You must first [get your Google API client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) to get an OAuth client ID which we'll call _GoogleClientId_.  

1. Set the appropriate `Authorized JavaScript origins`.  To test locally (recommended), add `http://localhost:5000` to the list of origins.  If you have already deployed to Cloud Run add your fully qualified Cloud Run origin i.e. `https://eventssample-XXXXXXXX-uc.a.run.app`.  You can get this by running:
    ```bash
    gcloud config set run/region us-central1
    gcloud run services describe eventssample --format="value(status.address.url)"
    ```

## How it works
1. The client requests the `GoogleClientId` from the server using `/user/clientid` (this id is not a secret).

1. Client calls [initCodeClient(...)](https://developers.google.com/identity/oauth2/web/guides/use-code-model#initialize_a_code_client), then [requestCode(...)](https://developers.google.com/identity/oauth2/web/guides/use-code-model#trigger_oauth_20_code_flow) with redirect to /user/authetnicate with a [GET request](https://developers.google.com/identity/oauth2/web/guides/use-code-model#authorization_endpoint) containing the `code` parameter.

1. /user/authenticate 
    1. [exchanges `code` for access_token & refresh_token](https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code) using https://oauth2.googleapis.com/token
    1. stores refresh token with user (long-term persistence)
    1. generates our signed JWT with user attributes, i.i.e. IsAdmin and returns this to the client

1. client keeps our JWT in local state and uses it in all subsequent server requests with: Authorization Bearer {JWT} 

1. client attempts server request with expired token
    1. gets a 401
    1. calls /user/refresh-token to get new JWT
    1. on success, updates the local state
    1. retries server request

1. /user/refresh-token
    1. ensures that there is an otherwise valid JWT that is expired
    1. acesses user service to get persisted refresh_token
    1. uses https://oauth2.googleapis.com/token to request a refresh_token
    1. creates a new JWT and returns to the user

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

## Update Cloud Run
You can either rebuild and redeploy your Cloud Run application with the new configuration, or you could just redeploy overriding the `Authentication__GoogleClientId` configuration value:

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

##Other
This was a good article: https://www.dolthub.com/blog/2022-05-04-google-signin-migration/ although I don't like the setInterval() for checking to see if the script was loaded.

The problem with using the id_token Google issues is that it is short-lived.  The documentation says that it automatically updates when you navigate around.  