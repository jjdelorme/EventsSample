import React, { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import { Avatar } from '@mui/material';
import Error from './Error';
import { getGoogleClientId, authenticate } from './eventService';

export default function Login(props) {
    const logout = () => {console.log('logged out')}
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [clientId, setClientId] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    
    const cbSetUser = () => { console.log('set user') };

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

    const getAuthCode = () => {
        if (!scriptLoaded) return;

        var client = window.google.accounts.oauth2.initCodeClient({
            client_id: clientId,
            scope: 'openid email profile',
            ux_mode: 'popup',
            callback: handleAuthCodeResponse
        });

        console.log('getting auth'); 
        client.requestCode();
    };

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
    }, [clientId]);

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
        document.querySelector("body")?.appendChild(script);
      
        return () => {
          window.google?.accounts.id.cancel();
          document.getElementById("google-client-script")?.remove();
        };
      }, [scriptLoaded]);

    let login;
    if (user == null && clientId != null)
        login = 
        <React.Fragment>
            <Button onClick={getAuthCode} 
                disabled={false}
                color="inherit" 
                variant="text">Login
            </Button>
        </React.Fragment>
    else 
        login = <Button onClick={logout} 
                    disabled={false}
                    color="inherit" 
                    variant="text">Logout
                </Button>;
    
    return login;
}