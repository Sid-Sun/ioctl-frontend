export interface SnippetModel {
    metadata: SnippetMetadataModel
    data: string
}

interface SnippetMetadataModel {
    id: string
    language: string
    ephemeral: boolean
}

export interface SnippetSpecModel {
    version: string
    keysalt: string
    ephemeral: boolean
    initvector: string
    ciphertext: string
}

export enum SnippetSpecVersion {
    v1 = "v1",
    v2 = "v2",
}

export enum SnippetType {
    StaticSnippet = +1,
    EphemeralSnippet,
    ProlongedSnippet,
    InvalidSnippet
}
