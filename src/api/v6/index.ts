import axios from 'axios';
import { AxiosRequestConfig } from 'axios'; 
import { response } from '../../lib/response-handler';
import { createChangesetEndPoint } from '../../lib/endpoints';
import { createChangesetXml } from '../../lib/osm-xml';
import  HttpErrorHandler from '../../lib/http-error-handler';
class Apiv6 {
    url: string;
    username: string;
    password: string;
    
    constructor(url: string, username: string, password: string) {
        this.url = url;
        this.username = username;
        this.password = password;
    }

    getUrl(): string {
        return this.url;
    }
    getUsername(): string {
        return this.url;
    }
    getPassword(): string {
        return this.password;
    }

    setUrl(url: string): void {
        this.url = url;
    }
    setCreds(username: string, password: string): void {
        this.username = username;
        this.password = password;
    }
   
    public async createChangeset(generator: string, createdBy: string): Promise<{ code: number, message: string }> {        
        const data = createChangesetXml(generator, createdBy, this.url);
        const conf: AxiosRequestConfig = {
            url: this.url + createChangesetEndPoint,
            method: 'put',
            data: data,
            auth: { username: this.username, password: this.password }
        };
        let res;
        try {
            res = await axios(conf);
        }
        catch (e) {
            throw new HttpErrorHandler(e);
        }
        const { data: changeSetId, status: code }  = res;
        return response(code, changeSetId);
    }
}

export default Apiv6;