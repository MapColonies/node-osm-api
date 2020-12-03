import { expect } from 'chai';
import nock = require('nock');

import Apiv6 from '../../src/index';
import { createChangesetEndPoint, closeChangesetEndPoint } from '../../src/lib/endpoints';
import { UnauthorizedError, BadXmlError, ChangesetNotFoundError, ChangesetAlreadyClosedError, OwnerMismatchError } from '../../src/lib/error';
import { testConf } from './config/tests-config';
const { baseUrl, username, password, changeSetNumber } = testConf;

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
  describe('/changeset/{id}/close}', function () {
    describe('happy flow', function () {
      describe('with opened changeset', function () {
        it('should close the changset', async function () {
          const apiv6 = new Apiv6(baseUrl, username, password);

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
});
