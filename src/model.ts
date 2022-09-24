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
