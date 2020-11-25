import nock = require('nock');
import { testConf } from '../config/tests-config';
import { createChangesetEndPoint } from '../../../lib/endpoints';

const { host, port } = testConf;

export const createChangesetNockNotAuth = (): void => {
    nock(`${host}:${port}`)
    .put(`${createChangesetEndPoint}`)
    .reply(401, "Couldn't authenticate you");
};

export const createChangesetNock = (): void => {
    nock(`${host}:${port}`)
    .put(`${createChangesetEndPoint}`)
    .reply(200, '12');
};