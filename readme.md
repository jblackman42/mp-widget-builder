# mp-widget-builder

mp-widget-builder is a comprehensive toolkit designed to help developers create and manage custom HTML widgets using React components in a simplified and efficient manner. It's meant to be used to integrate a website with a Ministry Platform database. It automates the setup and compilation processes, making it easy to integrate custom widgets into any web project.

## Features

- **Easy Setup**: Quick setup process to integrate with any existing project.
- **Automatic Compilation**: Bundles all components into a single distributable file.
- **Live Reload**: Develop your components with instant feedback.
- **Extensible**: Easily extendable to include more features or support for other frameworks.

## Installation

To install mp-widget-builder, run the following command in your project directory:

```powershell
npm install mp-widget-builder
```

This command installs mp-widget-builder along with its necessary dependencies, including React and ReactDOM.

## Usage

### Initializing a New Widget Project

To initialize a new widget project, run:

```powershell
npm mp-widget-builder init
```

This command sets up a basic structure in your project directory, including an example component and an alternate login component. The login components works exactly like the default Ministry Platform login widget, but with a simpler design.

### Building Widgets

Create your own widgets by adding a file to the components folder that was generated when you ran the init command. Your component's file name determines the custom html elements name; for example: the 'alt-login.jsx' is rendered inside the `<alt-login></alt-login>` html element. Any spaces in the filename will be converted to hyphens, and all letters will be converted to lowercase. To build your widgets into a distributable bundle, run:

```powershell
npx mp-widget-builder build
```

This will compile all your widget components into a `/dist/Bundle.js`, which can be included in any HTML file to use the widgets.

### Watching for Changes

To automatically rebuild widgets on file changes, run:

```powershell
npx mp-widget-builder watch
```

This enables live reloading, which is particularly useful during development.

## License

mp-widget-builder is licensed under the ISC License. See the `LICENSE` file for more details.
