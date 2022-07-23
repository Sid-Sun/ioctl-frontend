import { StreamLanguage } from "@codemirror/language"
import { Extension } from "@codemirror/state";


const handleLanguageChange = (language: string, setSelectedLanguage: (arg0: Extension | undefined) => void) => {
    switch (language) {
        case 'plaintext':
            setSelectedLanguage(undefined)
            break
        case 'cpp':
            import('@codemirror/lang-cpp')
                .then(lang => {
                    setSelectedLanguage(lang.cppLanguage)
                })
            break
        case 'html':
            import('@codemirror/lang-html')
                .then(lang => {
                    setSelectedLanguage(lang.htmlLanguage)
                })
            break
        case 'java':
            import('@codemirror/lang-java')
                .then(lang => {
                    setSelectedLanguage(lang.javaLanguage)
                })
            break
        case 'javascript':
            import('@codemirror/lang-javascript')
                .then(lang => {
                    setSelectedLanguage(lang.javascriptLanguage)
                })
            break
        case 'json':
            import('@codemirror/lang-json')
                .then(lang => {
                    setSelectedLanguage(lang.jsonLanguage)
                })
            break
        case 'markdown':
            import('@codemirror/lang-markdown')
                .then(lang => {
                    setSelectedLanguage(lang.markdownLanguage)
                })
            break
        case 'python':
            import('@codemirror/lang-python')
                .then(lang => {
                    setSelectedLanguage(lang.pythonLanguage)
                })
            break
        case 'rust':
            import('@codemirror/lang-rust')
                .then(lang => {
                    setSelectedLanguage(lang.rustLanguage)
                })
            break
        case 'xml':
            import('@codemirror/lang-xml')
                .then(lang => {
                    setSelectedLanguage(lang.xmlLanguage)
                })
            break
        // legacy language support
        case 'dockerfile':
            import('@codemirror/legacy-modes/mode/dockerfile')
                .then(lang => {
                    setSelectedLanguage(StreamLanguage.define(lang.dockerFile))
                })
            break
        case 'go':
            import('@codemirror/legacy-modes/mode/go')
                .then(lang => {
                    setSelectedLanguage(StreamLanguage.define(lang.go))
                })
            break
        case 'jinja2':
            import('@codemirror/legacy-modes/mode/jinja2')
                .then(lang => {
                    setSelectedLanguage(StreamLanguage.define(lang.jinja2))
                })
            break
        case 'swift':
            import('@codemirror/legacy-modes/mode/swift')
                .then(lang => {
                    setSelectedLanguage(StreamLanguage.define(lang.swift))
                })
            break
        case 'toml':
            import('@codemirror/legacy-modes/mode/toml')
                .then(lang => {
                    setSelectedLanguage(StreamLanguage.define(lang.toml))
                })
            break
        case 'yaml':
            import('@codemirror/legacy-modes/mode/yaml')
                .then(lang => {
                    setSelectedLanguage(StreamLanguage.define(lang.yaml))
                })
            break
    }
} 

export default handleLanguageChange