import { expect } from 'chai';
import nock = require('nock');

import Apiv6 from '../../src/index';
import { testConf } from './config/tests-config';
import { createChangesetEndPoint } from '../../src/lib/endpoints';

const { url, username, password } = testConf;

describe('apiv6', async function () {
    const apiv6 = new Apiv6(url, username, password);
    describe('happy flow', async function () {
        describe('/changeset/create', async function () {
            describe('with register user', async function () {
                it('should return 200 and changset number', async function () {
                    nock(url).put(createChangesetEndPoint).reply(200, '12');
                    const res = await apiv6.createChangeset("test-generator", "test-user");

                    expect(res).to.be.a('object')
                                        .with.property('code')
                                        .and.to.be.equal(200);
                    expect(res).to.have.property('message')
                            .and.to.be.equal(12);
                });
            });
            describe('with unregisterd user', async function () {
                it('should return error', async function () {
                    nock(url).put(createChangesetEndPoint).reply(401, "Couldn't authenticate you");
                    apiv6.setCreds('not-registerd', '123456');

                    try {
                        await apiv6.createChangeset("test-generator", "test-user");
                    } catch (e) {
                        expect(e).to.be.a('Error')
                                .with.property('message')
                                .and.to.be.equal('Couldn\'t authenticate you');
                        expect(e).to.have.property('status')
                                 .and.to.be.equal(401);
                    }
                });
            });
        });
    });
});