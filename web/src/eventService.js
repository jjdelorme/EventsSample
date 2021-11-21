//
// Module that wraps all service calls to the backing Events api service.
//
import {v1 as uuid} from 'uuid'; 

function getHeaders(authToken, contentType) {
  const headers = new Headers();  
  headers.append('Authorization', 'Bearer ' + authToken);
  if (contentType)
    headers.append('Content-Type', 'application/json');

  return headers;
}

export async function getGoogleClientId() {
  const response = await fetch("/user/clientid");
  const text = await response.text();
  return text;
}

export async function getVersion() {
  const response = await fetch("/version");
  if (!response.ok) {
    return "";
  }
  else {
    const json = response.json();
    return json;
  }
}

function authenticateRequest(token) {
  const authUrl = '/user/authenticate';
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
      { 
          idToken: token
      })
  };
  
  return fetch(authUrl, requestOptions);
}

export async function authenticate(token) {
  const response = await authenticateRequest(token);
  if (response.ok) {
      return await response.json();
  } else {
      throw new Error("Unable to login.");
  }
}

export async function loadEvents() {
  const eventsUrl = '/events';
  const response = await fetch(eventsUrl);
  
  return response.json();
}

export function createEventRequest(user, data) {
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(user.authToken, 'application/json'),
    body: JSON.stringify(
      { 
        id: uuid(),
        type: data.get('eventType'),
        date: data.get('eventDate'),
        product: data.get('product'),
        description: data.get('description')
      })
  };
  
  return fetch('/events', requestOptions);
}

export function deleteEventRequest(user, id) {
  const requestOptions = {
    method: 'DELETE',
    headers: getHeaders(user.authToken),
  };
      
  return fetch('/events/' + id, requestOptions);
}

export async function createUser(email, authToken) {
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(authToken, 'application/json'),
    body: JSON.stringify(
      { 
        email: email
      })
  };  
  
  return fetch('/user/create', requestOptions);
}