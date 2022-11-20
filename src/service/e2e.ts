import axios from "axios";
import { aeadDecrypt, aeadEncrypt, CryptoStack, generateEncryptionStack, getSnippetUUID } from "../crypto/crypto";
import { environment } from "../environment";
import { SnippetModel, SnippetSpecModel, SnippetSpecVersion, SnippetType } from "../model";
import { ServiceInterface } from "./model";

export class E2EService implements ServiceInterface {
    cryptoStack: Promise<CryptoStack> | undefined
    setAlert: (message: string) => void

    save(snippet: SnippetModel) {
        const setAlert = this.setAlert
        return new Promise<string>(async (resolve, reject) => {
            setAlert("generating crypto stack");
            if (this.cryptoStack === undefined) {
                reject('crypto stack not initialised')
                return
            }
            this.cryptoStack.then(stack => {
                snippet.metadata.id = stack.snippetID
                setAlert("encypting")
                aeadEncrypt(snippet, stack).then(snippetSpec => {
                    setAlert("saving")
                    return axios.post(environment.APIBaseURL + "e2e/" + stack.uuid, snippetSpec, {
                        headers: {
                            'Ephemeral': snippet.metadata.ephemeral
                        }
                    }).then(() => {
                        resolve(stack.snippetID)
                    }).catch(e => {
                        reject(e)
                    })
                })
            })
        })
    };

    static checkSnippetType(id: string) {
        const capitalLetterCount = (id.match(/[A-Z]/g) || []).length
        switch (capitalLetterCount) {
            case 1:
                return SnippetType.StaticSnippet
            case 2:
                return SnippetType.EphemeralSnippet
            case 3:
                return SnippetType.ProlongedSnippet
            default:
                return SnippetType.InvalidSnippet
        }
    }

    static getSnippetObjectKey(uuid: string, st: SnippetType) {
        switch (st) {
            case SnippetType.StaticSnippet:
                return "static/" + uuid
            case SnippetType.EphemeralSnippet:
                return "ephemeral/" + uuid
            case SnippetType.ProlongedSnippet:
                return "prolonged/" + uuid
            default:
                throw new Error("invalid snipppet type/id provided")
        }
    }

    load(id: string) {
        const setAlert = this.setAlert
        setAlert("generating crypto stack")
        return new Promise<SnippetModel>(async (resolve, reject) => {
            getSnippetUUID(id).then(uuid => {
                setAlert("downloading snippet")
                var snippetObjKey: string = ""
                try {
                    snippetObjKey = E2EService.getSnippetObjectKey(uuid, E2EService.checkSnippetType(id))
                } catch (e) {
                    reject(e)
                    return
                }
                axios.get<SnippetSpecModel>(environment.S3BaseURL + snippetObjKey).then(snippetSpec => {
                    setAlert("decrypting")
                    const version = snippetSpec.data.version === SnippetSpecVersion.v2 ? SnippetSpecVersion.v2 : SnippetSpecVersion.v1;
                    aeadDecrypt(snippetSpec.data, id, version).then(snippet => {
                        resolve(snippet)
                    })
                }).catch(e => {
                    reject(e)
                })
            })
        })
    };

    initSave(ephemeral: boolean) {
        if (this.cryptoStack === undefined) {
            this.cryptoStack = generateEncryptionStack(ephemeral)
        }
    }

    constructor(setAlert: (message: string) => void) {
        this.setAlert = setAlert
    }
}
