import nock = require('nock');
import { testConf } from '../config/tests-config';
import { createChangesetEndPoint, closeChangesetEndPoint } from '../../../lib/constants/endpoints';

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

export const closeChangesetNock = {
    sanity: (id: number): void => {
        nock(`${host}:${port}`)
        .put(`${closeChangesetEndPoint(id)}`)
        .reply(200, `changeset ${id} has closed`);
    },
    closedChangeset: (id: number): void => {
        nock(`${host}:${port}`)
        .put(`${closeChangesetEndPoint(id)}`)
        .reply(409, `The changeset ${id} was closed at 2020-11-25 09:35:13 UTC`);
    }
};