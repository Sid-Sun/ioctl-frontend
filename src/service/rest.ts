import axios from "axios";
import { environment } from "../environment";
import { SnippetModel } from "../model";
import { ServiceInterface } from "./model";

interface CreateResponse {
    URL: string
}

export class RestService implements ServiceInterface {
    setAlert: (message: string) => void

    save(snippet: SnippetModel) {
        const setAlert = this.setAlert
        return new Promise<string>(async (resolve, reject) => {
            setAlert('saving snippet')
            axios.post(environment.APIBaseURL, snippet).then((res) => {
                const data: CreateResponse = res.data
                const urlParts = data.URL.split('/')
                const id = urlParts[urlParts.length - 1]
                resolve(id)
            }).catch(e => {
                reject(e)
            })
        })
    };

    load(id: string) {
        const setAlert = this.setAlert
        return new Promise<SnippetModel>(async (resolve, reject) => {
            setAlert('downloading snippet')
            axios.get(environment.APIBaseURL + id).then((res) => {
                const data: SnippetModel = res.data
                resolve(data)
            }).catch(e => {
                reject(e)
            })
        })
    };

    constructor(setAlert: (message: string) => void) {
        this.setAlert = setAlert
    }
}
