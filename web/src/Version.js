import React, { useState, useEffect } from 'react';
import { Divider } from '@mui/material';
import Typography from '@mui/material/Typography';
import { getVersion } from './eventService';

export default function Version(props) {
    const [version, setVersion] = useState({});
    const clientVersion = process.env.REACT_APP_VERSION + "-" +
        process.env.NODE_ENV;

    useEffect(() => {
        getVersion()
        .then((result) => setVersion(result));
    }, []); 

    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            <Divider>Build</Divider>
            <br />
            <span>
                Client Version: {clientVersion} <br/>
                Server Version: {version.version} <br/>
                GCP Project: {version.projectId} <br />
                {version.computeInstanceId}
            </span>
        </Typography>
    );
}