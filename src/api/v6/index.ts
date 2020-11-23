import axios from 'axios';
import { AxiosRequestConfig } from 'axios'; 
import { response } from '../../lib/response-handler';
import { createChangeset } from '../../lib/endpoints';
import { createChangesetXml } from '../../lib/osmXml';

class Apiv6 {
    host: string;
    port: number;
    url: string;
    username: string;
    password: string;
    
    constructor(host: string, port: number, username: string, password: string) {
        this.host = host;
        this.port = port;
        this.url = `${host}:${port}`
        this.username = username;
        this.password = password;
    }

    getHost(): string {
        return this.host;
    }
    getPort(): number {
        return this.port;
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

    setHost(host: string): boolean {
        this.host = host;
        return true;
    }
    setPort(port: number): boolean {
        this.port = port;
        return true;
    }
    setUserName(username: string): boolean {
         this.username = username;
         return true;
    }
    setPassword(password: string): boolean {
        this.password = password;
        return true;
    }
   
    public async createChangeSet(generator: string, createdBy: string): Promise<{ code: number, message: string }> {        
        const data = createChangesetXml(generator, createdBy, this.host);
        const conf: AxiosRequestConfig = {
            url: this.url + createChangeset,
            method: 'put',
            data: data,
            auth: { username: this.username, password: this.password }
        };
        try {
            const res = await axios(conf);
            const { data: changeSetId, status: code }  = res;
            return response(code, changeSetId);
        }
        catch (e) {
            const { response: { status: code, data: message }  } = e;
            return response(code, message);
        }
    }
}

export default Apiv6;