import React, { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import { Avatar } from '@mui/material';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import Error from './Error';

async function getGoogleClientId() {
    console.log('GetGoogleClientId');
    const response = await fetch("/user/clientid");
    const text = await response.text();
    return text;
}

async function authenticate(token) {
    // Authenticate against our API
    const authUrl = '/user/authenticate';
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
        { 
            idToken: token
        })
    };
    
    const response = await fetch(authUrl, requestOptions);

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error("Unable to login.");
    }
}

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

        if (response && response.tokenId) {
            const token = response.tokenId;
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
    }

    let login;
    if (user == null)
        login = <React.Fragment>
          <GoogleLogin
            clientId={clientId}
            render={renderProps => (
                <Button onClick={renderProps.onClick} 
                    disabled={renderProps.disabled}
                    color="inherit" 
                    variant="text">Login
                </Button>
                )}
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
            isSignedIn={true}
          />
          <Error onErrorClose={handleErrorClose} message={error} />
        </React.Fragment>
    else 
        login = <GoogleLogout
                    clientId={clientId}
                    render={renderProps => (
                        <Button onClick={renderProps.onClick}
                                disabled={renderProps.disabled}>
                            <Avatar alt={user.name} src={user.picture} />
                        </Button>
                        )}
                    buttonText="Logout"
                    onLogoutSuccess={logout}
                />
    
    return login;
}