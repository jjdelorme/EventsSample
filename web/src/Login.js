import React, { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import Error from './Error';
import { getGoogleClientId, authenticate } from './eventService';

export default function Login(props) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [googleClientId, setClientId] = useState(null);
    const onSetUser = props.setUser;    
    const user = props.user;
    const [error, setError] = useState(null);
    const handleErrorClose = () => setError(null);

    const cbSetUser = useCallback((data) => {
        onSetUser(data);
    }, [onSetUser]);

    /* Invoked on response from Google sign-in form. */
    const handleAuthCodeResponse = (response) => {
        console.log('authcode response: ', response);

        if (response) {
            const authCode = response.code;
            console.log('code', authCode);

            authenticate(authCode).then(data => {
                if (data != null)
                    console.log('auth', data);
                    cbSetUser(data);
            })
            .catch((err) => {
                console.log("Login error: ", err);
                setError("Server error, unable to login.");
            });
        }        
    }

    /* Authenticates against Google Identity Service. */
    const getAuthCode = () => {
        if (!scriptLoaded) return;

        var client = window.google.accounts.oauth2.initCodeClient({
            client_id: googleClientId,
            scope: 'openid email profile',
            ux_mode: 'popup',
            callback: handleAuthCodeResponse
        });

        console.log('getting auth'); 
        client.requestCode();
    };

    const logout = () => {
        console.log('logged out')  ;
        cbSetUser(null);
    }; 

    /* Retrieve Google Client Id required for Authentication from backend api. */
    useEffect(() => {
        getGoogleClientId()
        .then(clientId => {
            if (clientId === "") {
                authenticate("")
                .then(data => cbSetUser(data));
            }
            else {
                setClientId(clientId);
            }
        });
    }, [googleClientId]);

    /* 
        Load Google Sign In script (gsi) as per:
        https://developers.google.com/identity/gsi/web/reference/js-reference
        https://developers.google.com/identity/oauth2/web/guides/use-code-model 
    */
    useEffect(() => {
        if (scriptLoaded) return undefined;

        const initializeGoogle = () => {
            console.log('initializing...');
          if (!window.google || scriptLoaded) return;
      
          setScriptLoaded(true);
        };

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.onload = initializeGoogle;
        script.async = true;
        script.id = "google-client-script";
        const body = document.querySelector("body");
        if (body)
            body.appendChild(script);
      
        return () => {
          if (window.google) {
            window.google.accounts.id.cancel();
            const gScript = document.getElementById("google-client-script");
            if (gScript) gScript.remove();
          }
        };
      }, [scriptLoaded]);

    let login;
    if (user == null && googleClientId != null)
        login = 
        <React.Fragment>
            <Button onClick={getAuthCode} 
                disabled={false}
                color="inherit" 
                variant="text">Login
            </Button>
            <Error onErrorClose={handleErrorClose} message={error} />
        </React.Fragment>
    else 
        login = <Button onClick={logout} 
                    disabled={false}
                    color="inherit" 
                    variant="text">Logout
                </Button>;
    
    return login;
}