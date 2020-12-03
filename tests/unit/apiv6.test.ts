import { expect } from 'chai';
import nock = require('nock');

import Apiv6 from '../../src/index';
import { createChangesetEndPoint, closeChangesetEndPoint, uploadChangesetEndPoint } from '../../src/lib/endpoints';
import {
  UnauthorizedError,
  BadXmlError,
  ChangesetNotFoundError,
  ChangesetAlreadyClosedError,
  OwnerMismatchError,
  MismatchChangesetError,
  ChangesetOrDiffElementsNotFoundError,
} from '../../src/lib/errors';
import { testConf } from './config/tests-config';
const { baseUrl, username, password } = testConf;

describe('apiv6', function () {
  describe('/changeset/create', function () {
    describe('happy flow', function () {
      describe('with register user', function () {
        it('should return changset number', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);

          nock(baseUrl).put(createChangesetEndPoint).reply(200, '12');

          const xmlData = `<osm>
                                        <changeset version='0.6' generator='test-generator'>
                                            <tag k='created_by' v='test-user'/>
                                        </changeset>
                                    </osm>`;
          const res = await apiv6.createChangeset(xmlData);

          expect(res).to.be.equal(12);
        });
      });
    });
    describe('sad flow', function () {
      describe('with unregisterd user', function () {
        it('should return UnauthorizedError', async function () {
          const apiv6 = new Apiv6(baseUrl, 'not-registerd', '123456');

          nock(baseUrl).put(createChangesetEndPoint).reply(401, "Couldn't authenticate you");

          const xmlData = `<osm>
                                        <changeset version='0.6' generator='test-generator'>
                                            <tag k='created_by' v='test-user'/>
                                        </changeset>
                                    </osm>`;
          try {
            await apiv6.createChangeset(xmlData);
          } catch (e) {
            return expect(e).to.be.instanceOf(UnauthorizedError).with.property('message').and.to.be.equal("Couldn't authenticate you");
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with bad xml', function () {
        it('should return BadXmlError', async function () {
          const apiv6 = new Apiv6(baseUrl, 'not-registerd', '123456');

          nock(baseUrl).put(createChangesetEndPoint).reply(400, 'Cannot parse valid changeset from xml string');

          const xmlData = `<BAD>
                                        <changeset version='0.6' generator='sync'>
                                            <tag k='created_by' v='iD 2.18.5'/>
                                            <tag k='locale' v='he'/>
                                            <tag k='changesets_count' v='1'/>
                                        </changeset>
                                    </BAD>`;
          try {
            await apiv6.createChangeset(xmlData);
          } catch (e) {
            return expect(e).to.be.instanceOf(BadXmlError).with.property('message').and.to.be.equal('Cannot parse valid changeset from xml string');
          }
          throw new Error('should have thrown an error');
        });
      });
    });
  });

  describe('/changeset/#id/close', function () {
    describe('happy flow', function () {
      describe('with opened changeset', function () {
        it('should close the changset', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).put(closeChangesetEndPoint(changeSetNumber)).reply(200);

          const res = await apiv6.closeChangeset(changeSetNumber);
          expect(res).to.be.equal(undefined);
        });
      });
    });
    describe('sad flow', function () {
      describe('with mismatch user', function () {
        it('should return OwnerMismatchError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).put(closeChangesetEndPoint(changeSetNumber)).reply(409, "The user doesn't own that changeset");

          try {
            await apiv6.closeChangeset(changeSetNumber);
          } catch (e) {
            return expect(e).to.be.instanceof(OwnerMismatchError).with.property('message').and.to.be.equal("The user doesn't own that changeset");
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with already closed changeset', function () {
        it('should return ChangesetAlreadyClosedError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).put(closeChangesetEndPoint(changeSetNumber)).reply(409, `changeset ${changeSetNumber} was closed at`);

          try {
            await apiv6.closeChangeset(changeSetNumber);
          } catch (e) {
            return expect(e)
              .to.be.instanceof(ChangesetAlreadyClosedError)
              .with.property('message')
              .and.to.be.equal(`changeset ${changeSetNumber} was closed at`);
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with not exsits changeset', function () {
        it('should return ChangesetNotFoundError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).put(closeChangesetEndPoint(changeSetNumber)).reply(404);

          try {
            await apiv6.closeChangeset(changeSetNumber);
          } catch (e) {
            return expect(e).to.be.instanceof(ChangesetNotFoundError);
          }
          throw new Error('should have thrown an error');
        });
      });
    });
  });

  describe('/changeset/#id/upload', function () {
    describe('happy flow', function () {
      describe('with valid osm change', function () {
        it('should return 200 and diff result', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          const mockRes = `<?xml version="1.0" encoding="UTF-8"?>
                          <diffResult version="0.6" generator="OpenStreetMap server" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">
                            <node old_id="57" new_id="57" new_version="2"/>
                          </diffResult>`;
          nock(baseUrl).post(uploadChangesetEndPoint(changeSetNumber)).reply(200, mockRes);

          const xmlData = `<osmChange version="0.6" generator="iD">
                                <create/>
                                <modify>
                                    <node id="57" lon="34.957795931916124" lat="32.82084301679048" version="1" changeset=${changeSetNumber}/>
                                </modify>
                                <delete if-unused="true"/>
                            </osmChange>`;

          const res = await apiv6.uploadChangeset(changeSetNumber, xmlData);

          expect(res).to.be.equal(mockRes);
        });
      });
    });
    describe('sad flow', function () {
      describe('with bad xml', function () {
        it('should return BadXmlError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).post(uploadChangesetEndPoint(changeSetNumber)).reply(400, "Document element should be 'osmChange'");

          const xmlData = `<BAD version="0.6" generator="iD">
                                <create/>
                                <modify>
                                    <node id="57" lon="34.957795931916124" lat="32.82084301679048" version="1" changeset=${changeSetNumber}/>
                                </modify>
                                <delete if-unused="true"/>
                            </BAD>`;
          try {
            await apiv6.uploadChangeset(changeSetNumber, xmlData);
          } catch (e) {
            return expect(e).to.be.instanceof(BadXmlError);
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with not exsits changeset', function () {
        it('should return ChangesetOrDiffElementsNotFoundError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 7000;

          nock(baseUrl).post(uploadChangesetEndPoint(changeSetNumber)).reply(404);

          const xmlData = `<osmChange version="0.6" generator="iD">
                                <create/>
                                <modify>
                                    <node id="57" lon="34.957795931916124" lat="32.82084301679048" version="1" changeset=${changeSetNumber}/>
                                </modify>
                                <delete if-unused="true"/>
                            </osmChange>`;
          try {
            await apiv6.uploadChangeset(changeSetNumber, xmlData);
          } catch (e) {
            return expect(e).to.be.instanceof(ChangesetOrDiffElementsNotFoundError);
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with already closed changeset', function () {
        it('should return ChangesetAlreadyClosedError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).post(uploadChangesetEndPoint(changeSetNumber)).reply(409, `changeset ${changeSetNumber} was closed at`);

          const xmlData = `<osmChange version="0.6" generator="iD">
                                <create/>
                                <modify>
                                    <node id="57" lon="34.957795931916124" lat="32.82084301679048" version="1" changeset=${changeSetNumber}/>
                                </modify>
                                <delete if-unused="true"/>
                            </osmChange>`;
          try {
            await apiv6.uploadChangeset(changeSetNumber, xmlData);
          } catch (e) {
            return expect(e).to.be.instanceof(ChangesetAlreadyClosedError);
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with mismatch user', function () {
        it('should return OwnerMismatchError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).post(uploadChangesetEndPoint(changeSetNumber)).reply(409, "The user doesn't own that changeset");

          const xmlData = `<osmChange version="0.6" generator="iD">
                                <create/>
                                <modify>
                                    <node id="57" lon="34.957795931916124" lat="32.82084301679048" version="1" changeset=${changeSetNumber}/>
                                </modify>
                                <delete if-unused="true"/>
                            </osmChange>`;
          try {
            await apiv6.uploadChangeset(changeSetNumber, xmlData);
          } catch (e) {
            return expect(e).to.be.instanceof(OwnerMismatchError);
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with mismatch changeset', function () {
        it('should return MismatchChangesetError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;
          const mismatchChangesetNumber = 13;

          nock(baseUrl)
            .post(uploadChangesetEndPoint(changeSetNumber))
            .reply(409, `Changeset mismatch: Provided ${mismatchChangesetNumber} but only ${changeSetNumber} is allowed`);

          const xmlData = `<osmChange version="0.6" generator="iD">
                                <create/>
                                <modify>
                                    <node id="57" lon="34.957795931916124" lat="32.82084301679048" version="1" changeset=${mismatchChangesetNumber}/>
                                </modify>
                                <delete if-unused="true"/>
                            </osmChange>`;
          try {
            await apiv6.uploadChangeset(changeSetNumber, xmlData);
          } catch (e) {
            return expect(e).to.be.instanceof(MismatchChangesetError);
          }
          throw new Error('should have thrown an error');
        });
      });
      describe('with unregisterd user', function () {
        it('should return UnauthorizedError', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);
          const changeSetNumber = 12;

          nock(baseUrl).post(uploadChangesetEndPoint(changeSetNumber)).reply(401, "Couldn't authenticate you");

          const xmlData = `<osmChange version="0.6" generator="iD">
                                <create/>
                                <modify>
                                    <node id="57" lon="34.957795931916124" lat="32.82084301679048" version="1" changeset=${changeSetNumber}/>
                                </modify>
                                <delete if-unused="true"/>
                            </osmChange>`;
          try {
            await apiv6.uploadChangeset(changeSetNumber, xmlData);
          } catch (e) {
            return expect(e).to.be.instanceof(UnauthorizedError);
          }
          throw new Error('should have thrown an error');
        });
      });
    });
  });
});
