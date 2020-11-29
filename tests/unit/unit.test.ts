import { expect } from 'chai';
import nock = require('nock');

import Apiv6 from '../../src/index';
import { createChangesetEndPoint } from '../../src/lib/endpoints';
import { testConf } from './config/tests-config';
import { createChangesetXml } from './lib/osm-xml';

const { baseUrl, username, password } = testConf;

describe('apiv6', function () {
    describe('happy flow', function () {
        describe('/changeset/create', function () {
            describe('with register user', function () {
                it('should return 200 and changset number', async function () {
                    const apiv6 = new Apiv6(baseUrl, username, password);
                    
                    nock(baseUrl).put(createChangesetEndPoint).reply(200, '12');
                    
                    const xmlData = createChangesetXml("test-generator", "test-user");
                    const res = await apiv6.createChangeset(xmlData);

                    expect(res).to.be.a('object')
                                        .with.property('status')
                                        .and.to.be.equal(200);
                    expect(res).to.have.property('data')
                            .and.to.be.equal(12);
                });
            });
            describe('with unregisterd user', function () {
                it('should return error', async function () {
                    const apiv6 = new Apiv6(baseUrl, 'not-registerd', '123456');

                    nock(baseUrl).put(createChangesetEndPoint).reply(401, "Couldn't authenticate you");
                    
                    const xmlData = createChangesetXml("test-generator", "test-user");

                    try {
                        await apiv6.createChangeset(xmlData);
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