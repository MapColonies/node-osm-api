import nock = require('nock');
import { testConf } from '../../config/tests-config';
import { createChangesetEndPoint, uploadChangesetEndPoint } from '../../../lib/endpoints';
import { uploadResMessage } from '../../lib/constants/resMessages';
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

export const uploadChangesetNock = {
    sanity: (id: number): void => {
        nock(`${host}:${port}`)
        .post(`${uploadChangesetEndPoint(id)}`)
        .reply(200, uploadResMessage);
    }
};