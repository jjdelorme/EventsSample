import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Avatar } from '@mui/material';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import Error from './Error';

export default function Login(props) {
    const GoogleClientId =
     "831737255503-e4d00s4rf53kfha1t6h250siulge5gvc.apps.googleusercontent.com";
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const handleErrorClose = () => setError(null);
    
    const cbSetUser = (data) => {
        setUser(data);
        props.setUser(data);
    }
    
    const responseGoogle = (response) => {
        console.log('login response', response);

        if (response && response.tokenId) {
            const token = response.tokenId;
            console.log('token', token);

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
            fetch(authUrl, requestOptions).then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Unable to login.");
                }
            })
            .then(data => {
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
            clientId={GoogleClientId}
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
                    clientId={process.env.GoogleClientId}
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