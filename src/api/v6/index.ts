import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import StatusCodes from 'http-status-codes';
import { createChangesetEndPoint } from '../../lib/endpoints';
import  { UnauthorizedError, BadXmlError, InternalServerError } from '../../lib/error-handler';
class Apiv6 {
    private readonly httpClient: AxiosInstance;
    
    public constructor(private readonly baseUrl: string, username: string, password: string) {
        this.httpClient = axios.create({ baseURL: baseUrl, auth: { username, password } });
    }
   
    public async createChangeset(data: string): Promise<number> {
        let res: AxiosResponse<number>;
        try {
            res = await this.httpClient.put<number>(createChangesetEndPoint, data);
        } 
        catch (e) {
            const axiosError = e as AxiosError;

            if (axiosError.response?.status === StatusCodes.BAD_REQUEST) {
                throw new BadXmlError(axiosError);
            } else if (axiosError.response?.status === StatusCodes.UNAUTHORIZED) {
                throw new UnauthorizedError(axiosError); 
            } else if (axiosError.response?.status === StatusCodes.INTERNAL_SERVER_ERROR) {
                throw new InternalServerError(axiosError);
            } else {
                throw new Error(e);
            }
        }
        const { data: changeSetId } = res;
        return changeSetId;
    }
}

export default Apiv6;