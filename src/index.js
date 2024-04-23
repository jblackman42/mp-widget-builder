import React, {useState, useEffect} from 'react';
import { createRoot } from 'react-dom/client';
import { MdErrorOutline } from "react-icons/md";

const context = require.context('@/components', true, /\.(jsx|tsx)$/);
const cssContext = require.context('@/styles', true, /\.(css)$/);

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
      const elementName = `${filename.replace('./', '').replace(/\.\w+$/, '').toLowerCase()}`;
      class DynamicCustomElement extends HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const props = {};

          const componentStylesheet = cssContext.keys().find(cssFilename => cssFilename.replace('./', '').replace(/\.\w+$/, '').toLowerCase() === elementName);
          if (componentStylesheet) {
            const style = document.createElement('style');
            style.textContent = cssContext(componentStylesheet).default;
            shadowRoot.appendChild(style);
          }
          

          // Transfer attributes to props
          Array.from(this.attributes).forEach(attr => {
            const propName = attr.name.replace(/-(\w)/g, (match, letter) => letter.toUpperCase());
            props[propName] = attr.value;
          });

          const root = createRoot(shadowRoot);
          root.render(React.createElement(AuthComponent, { Component, props }));
        }
      }

      customElements.define(elementName, DynamicCustomElement);
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