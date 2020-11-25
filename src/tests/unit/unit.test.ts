import { expect } from 'chai';
import { describe, it } from 'mocha';

import Apiv6 from '../../../index';
import { testConf } from './config/tests-config';
import { createChangesetNock, createChangesetNockNotAuth } from './helper/nock-apiv6';

const { host, port, username, password } = testConf;

describe('apiv6', async function () { 
    const apiv6 = new Apiv6(host, port, username, password);
    describe('happy flow', async function () {
        describe('/changeset/create', async function () {
            describe('senity check', async function () {
                before(async function () {
                    createChangesetNock();
                });
                it('should return changset number', async function () {
                    const res = await apiv6.createChangeset("test-generator", "test-user");
                    expect(res).to.be.a('object')
                                        .with.property('code')
                                        .and.to.be.equal(200);
                    expect(res).to.have.property('message')
                            .and.to.be.equal(12);
                });
            });
            describe('with unregisterd user', async function () {
                before(async function () {
                    createChangesetNockNotAuth();
                });
                it('should return error', async function () {
                    apiv6.setUserName('not-registerd');
                    const res = await apiv6.createChangeset("test-generator", "test-user");
                    expect(res).to.be.a('object')
                                        .with.property('code')
                                        .and.to.be.equal(401);
                    expect(res).to.have.property('message')
                            .and.to.be.equal("Couldn't authenticate you");
                });
            });
        });
    });
});