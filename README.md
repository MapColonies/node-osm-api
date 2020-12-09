# node-osm-api

Easy Node.js, TypeScript communication with OpenStreetMap api

```ts
import { Apiv6 } from '@map-colonies/node-osm-api';

const api = new Apiv6('https://www.openstreetmap.org', USER_NAME, PASSWORD);
```

## Installation

```shell
$ npm install @map-colonies/node-osm-api
```

## Usage

- Right now we only support create/upload/close changesets

In Node.js TypeScript:

Performing `Create changeset`:

```ts
let changesetID: number;

async function createChangeset() {
  try {
    changesetID = await api.createChangeset(CREATE_CHANGESET_BODY_XML);
  } catch (e) {
    console.error(e);
  }
}
```

Possibble error types:

- `UnauthorizedError`
- `BadXmlError`

---

Performing `Upload changeset`:

```ts
let diffRes: string;

async function uploadChangeset() {
  try {
    // returns osm xml diff result as string
    diffRes = await api.uploadChangeset(CHANGESET_ID, OSC_XML);
  } catch (e) {
    console.error(e);
  }
}
```

Possibble error types:

- `UnauthorizedError`
- `BadXmlError`
- `ChangesetOrDiffElementsNotFoundError`
- `ChangesetAlreadyClosedError`
- `OwnerMismatchError`
- `MismatchChangesetError`

---

Performing `Close changeset`:

```ts
async function closeChangeset() {
  try {
    await api.closeChangeset(CHANGESET_ID);
  } catch (e) {
    console.error(e);
  }
}
```

Possibble error types:

- `UnauthorizedError`
- `NotAllowedError`
- `ChangesetNotFoundError`
- `ChangesetAlreadyClosedError`
- `OwnerMismatchError`

## JavaScript

```js
const nodeOsmApi = require('node-osm-api');

const api = new nodeOsmApi.Apiv6('https://www.openstreetmap.org', USER_NAME, PASSWORD);

async function createChangeset() {
  try {
    changesetID = await api.createChangeset(CREATE_CHANGESET_BODY_XML);
  } catch (e) {
    console.error(e);
  }
}
```
