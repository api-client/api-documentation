# API documentation

A set of components to render an API documentation from the AMF graph model.

> This is a work in progress.

## Usage

### Installation

```sh
npm install --save @api-client/api-documentation
```

### API data model

The components work with `@api-client/amf-store`. Use the store to initialize the API. The store acts as a value provider for the component. When initialized, the component dispatches a series of DOM events handled by the store to read the data from the graph.
The hosting application has to initialize the API and the graph before these elements are inserted into the DOM.

```javascript
import { AmfStoreService } from '@api-client/amf-store';

const store = new AmfStoreService(window, {
  workerLocation: './node_modules/@api-client/amf-store/workers/AmfWorker.js',
});
await store.init();
const graphModel = await readDataModelSomehow();
await store.loadGraph(graphModel);
```

The elements queries the store once they are attached to the DOM.

## Development

```sh
git clone https://github.com/@api-client/api-documentation
cd api-documentation
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```

## License

<!-- API Components © 2021 by Pawel Psztyc is licensed under CC BY 4.0. -->

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><span property="dct:title">API Components</span> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/jarrodek">Pawel Psztyc</a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"></a></p>
