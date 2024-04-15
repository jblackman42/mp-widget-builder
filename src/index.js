import React, {useState, useEffect} from 'react';
import { createRoot } from 'react-dom/client';
import { MdErrorOutline } from "react-icons/md";

const context = require.context('user-components', true, /\.(jsx|tsx)$/);
class EventEmitter {
  constructor() {
    this.events = {};
  }

  subscribe(eventName, fn) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(fn);
    return () => this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
  }

  emit(eventName, data) {
    const event = this.events[eventName];
    if (event) {
      event.forEach(fn => {
        fn.call(null, data);
      });
    }
  }
}

const EventBus = new EventEmitter;
const AuthComponent = ({Component, props}) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = EventBus.subscribe('userChanged', setUser);
    return unsubscribe;
  });

  const updateGlobalUser = (newUser) => {
    EventBus.emit('userChanged', newUser);
  }

  const ErrorComponent = React.createElement(
    'div',
    { className: 'error-container', style: { color: 'black', padding: '4px 8px', borderRadius: '8px', backgroundColor: '#ffe0e0', border: '1px solid #e74c3c', display: 'flex' } },
    React.createElement(MdErrorOutline, {style: {fontSize: '24px', flexShrink: '0'}}),
    React.createElement('p', { className: 'error-message', style: {margin: '0 8px'} }, error),
  );
  const RenderComponent = React.createElement(Component, {...props, userData: user, setUserData: updateGlobalUser, setError: setError});

  return error ? ErrorComponent : RenderComponent;
}

document.addEventListener('DOMContentLoaded', () => {

  context.keys().forEach((filename) => {
    try {
      const Component = context(filename).default;
      const elementName = filename.replace('./', '').replace(/\.\w+$/, '').toLowerCase();
      if (Component) {
        document.querySelectorAll(elementName).forEach(elem => {
          const props = {};

          Array.from(elem.attributes).forEach(attr => {
            const propName = attr.name.replace(/-(\w)/g, (match, letter) => letter.toUpperCase());
            props[propName] = attr.value;
          });
          const root = createRoot(elem);
          root.render(React.createElement(AuthComponent, {Component, props}));
        });
      } else {
        console.error(`No default export found in ${filename}`);
      }
    } catch (error) {
      console.error(`Error processing ${filename}: ${error}`);
    }
  });
});

(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const cacheKey = urlParams.get("cacheKey");
  if (cacheKey) {
    sessionStorage.setItem("cachedKey", cacheKey);
  }
})();