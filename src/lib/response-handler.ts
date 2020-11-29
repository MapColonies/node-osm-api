export interface IResponse<T = string> {
    status: number, 
    data: T
}