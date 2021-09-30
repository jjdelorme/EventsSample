import React, { Component } from 'react';
import * as signalR from "@microsoft/signalr";  

class NewEventNotification extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      notifyHub: null,
      message: ''      
    };
  }

  componentDidMount() {
    const hubUrl = '/notifyhub'

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .build();

    this.setState({ notifyHub: hub }, () => {
      this.state.notifyHub.start()
        .then(() => console.log('Connection started.'))
        .catch(err => console.log('Connection error', err));
  
        this.state.notifyHub.on('newEventMessage', (data) => {
          console.log('message', data);
          this.setState({ message: data });
      });
    });
  }

  render() {
    return <div>Here is the {this.state.message}</div>;
  }
}

export default NewEventNotification;