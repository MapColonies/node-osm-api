import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import StatusCodes from 'http-status-codes';
import { createChangesetEndPoint, closeChangesetEndPoint, uploadChangesetEndPoint } from '../../lib/endpoints';
import {
  UnauthorizedError,
  BadXmlError,
  ChangesetNotFoundError,
  OwnerMismatchError,
  NotAllowedError,
  ChangesetAlreadyClosedError,
  MismatchChangesetError,
  ChangesetOrDiffElementsNotFoundError,
  ConflictErrorType,
} from '../../lib/errors';
import { OWNER_MISMATCH, CHANGESET_MISMATCH, CHANGESET_ALREADY_CLOSED } from '../../lib/constants';

export class Apiv6 {
  private readonly httpClient: AxiosInstance;

  public constructor(private readonly baseUrl: string, username: string, password: string) {
    this.httpClient = axios.create({
      baseURL: baseUrl,
      auth: { username, password },
    });
  }

  public async createChangeset(data: string): Promise<number> {
    let res: AxiosResponse<number>;
    try {
      res = await this.httpClient.put<number>(createChangesetEndPoint, data);
    } catch (e) {
      const axiosError = e as AxiosError;

      if (axiosError.response?.status === StatusCodes.BAD_REQUEST) {
        throw new BadXmlError(axiosError);
      } else if (axiosError.response?.status === StatusCodes.UNAUTHORIZED) {
        throw new UnauthorizedError(axiosError);
      } else {
        throw e;
      }
    }
    const { data: changeSetId } = res;
    return changeSetId;
  }

  public async closeChangeset(id: number): Promise<void> {
    try {
      await this.httpClient.put<number>(closeChangesetEndPoint(id));
    } catch (e) {
      const axiosError = e as AxiosError;

      if (axiosError.response?.status === StatusCodes.UNAUTHORIZED) {
        throw new UnauthorizedError(axiosError);
      } else if (axiosError.response?.status === StatusCodes.METHOD_NOT_ALLOWED) {
        throw new NotAllowedError(axiosError);
      } else if (axiosError.response?.status === StatusCodes.NOT_FOUND) {
        throw new ChangesetNotFoundError(axiosError);
      } else if (axiosError.response?.status === StatusCodes.CONFLICT) {
        if (axiosError.response.data === OWNER_MISMATCH) {
          throw new OwnerMismatchError(axiosError);
        }
        throw new ChangesetAlreadyClosedError(axiosError);
      } else {
        throw e;
      }
    }
  }

  public async uploadChangeset(id: number, data: string): Promise<string> {
    let res: AxiosResponse<string>;
    try {
      res = await this.httpClient.post<string>(uploadChangesetEndPoint(id), data);
    } catch (e) {
      const axiosError = e as AxiosError<string>;
      let error;

      switch (axiosError.response?.status) {
        case StatusCodes.BAD_REQUEST: {
          error = new BadXmlError(axiosError);
          break;
        }
        case StatusCodes.NOT_FOUND: {
          error = new ChangesetOrDiffElementsNotFoundError(axiosError);
          break;
        }
        case StatusCodes.CONFLICT: {
          const data = axiosError.response.data;
          error = this.conflictErrorFactory(data, axiosError);
          break;
        }
        case StatusCodes.UNAUTHORIZED: {
          error = new UnauthorizedError(axiosError);
          break;
        }
        default: {
          error = e;
          break;
        }
      }
      throw error;
    }
    const { data: diffResult } = res;
    return diffResult;
  }

  private conflictErrorFactory(data: string, axiosError: AxiosError): ConflictErrorType {
    if (data.includes(CHANGESET_ALREADY_CLOSED)) {
      return new ChangesetAlreadyClosedError(axiosError);
    } else if (data.includes(OWNER_MISMATCH)) {
      return new OwnerMismatchError(axiosError);
    } else if (data.includes(CHANGESET_MISMATCH)) {
      return new MismatchChangesetError(axiosError);
    } else {
      return new Error((axiosError as unknown) as string);
    }
  }
}

export default Apiv6;
