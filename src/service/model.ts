import { SnippetModel } from "../model"

export interface ServiceInterface {
    save: (snipet: SnippetModel) => Promise<string>
    load: (id: string) => Promise<SnippetModel>
}
