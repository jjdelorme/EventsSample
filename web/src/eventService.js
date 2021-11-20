//
// Module that wraps all service calls to the backing Events api service.
//
import {v1 as uuid} from 'uuid'; 

function getHeaders(user, contentType) {
  const headers = new Headers();  
  headers.append('Authorization', 'Bearer ' + user.authToken);
  if (contentType)
    headers.append('Content-Type', 'application/json');

  return headers;
}

export async function loadEvents() {
  const eventsUrl = '/events';
  const response = await fetch(eventsUrl);
  
  return response.json();
}

export function createEventRequest(user, data) {
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(user, 'application/json'),
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
    headers: getHeaders(user),
  };
      
  return fetch('/events/' + id, requestOptions);
}
