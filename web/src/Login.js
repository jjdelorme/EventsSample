import React, { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import { Avatar } from '@mui/material';
import GoogleOneTapLogin from 'react-google-one-tap-login';
import Error from './Error';
import { getGoogleClientId, authenticate } from './eventService';

export default function Login(props) {
    const [clientId, setClientId] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const handleErrorClose = () => setError(null);
    const onSetUser = props.setUser;

    const cbSetUser = useCallback((data) => {
        setUser(data);
        onSetUser(data);
    }, [onSetUser]);
    
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
    }, [cbSetUser]);

    // Don't show login if we don't have a client id.
    if (clientId == null) {
        return null;
    }

    const responseGoogle = (response) => {
        console.log('login response', response);

        if (response) {
            const token = response.id_token;
            console.log('token', token);

            authenticate(token).then(data => {
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

    const logout = () => {
        console.log('logged out')  ;
        cbSetUser(null);
    };    
    

    let login;
    if (user == null && clientId != null)
        login = 
        <React.Fragment>
          <GoogleOneTapLogin 
            onError={responseGoogle} 
            onSuccess={responseGoogle} 
            googleAccountConfigs={
                { client_id: clientId, cancel_on_tap_outside: false }
            }
            render={renderProps => (
                <Button onClick={renderProps.onClick} 
                    disabled={renderProps.disabled}
                    color="inherit" 
                    variant="text">Login
                </Button>
            )}                 
          />
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