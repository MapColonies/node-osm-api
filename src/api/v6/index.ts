import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import StatusCodes from 'http-status-codes';
import { createChangesetEndPoint, closeChangesetEndPoint } from '../../lib/endpoints';
import {
  UnauthorizedError,
  BadXmlError,
  ChangesetNotFoundError,
  OwnerMismatchError,
  NotAllowedError,
  ChangesetAlreadyClosedError,
} from '../../lib/errors';
import { OWNER_MISMATCH } from '../../lib/constants';
class Apiv6 {
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
        throw new Error(e);
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
        throw new Error(e);
      }
    }
  }
}

export default Apiv6;
