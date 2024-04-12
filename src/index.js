import React from 'react';
import { createRoot } from 'react-dom/client';

const context = require.context('user-components', true, /\.(jsx|tsx)$/);

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
          root.render(React.createElement(Component, {props}));
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