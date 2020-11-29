import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IResponse } from '../../lib/response-handler';
import { createChangesetEndPoint } from '../../lib/endpoints';
import  HttpErrorHandler from '../../lib/http-error-handler';
class Apiv6 {
    private readonly httpClient: AxiosInstance;
    
    public constructor(private readonly baseUrl: string, username: string, password: string) {
        this.httpClient = axios.create({ baseURL: baseUrl, auth: { username, password } });
    }
   
    public async createChangeset(data: string): Promise<IResponse<number>> {
        let res: AxiosResponse<number>;
        try {
            res = await this.httpClient.put<number>(createChangesetEndPoint, data);
        }
        catch (e) {
            throw new HttpErrorHandler(e);
        }
        const { status, data: changeSetId } = res;
        return { status, data: changeSetId };
    }
}

export default Apiv6;