import { Extension } from "@codemirror/state";
import { duotoneDark } from "@uiw/codemirror-theme-duotone";

const handleThemeChange = (theme: string, setSelectedTheme: (arg0: Extension) => void) => {
    switch (theme) {
        case 'duotone-dark':
            setSelectedTheme(duotoneDark)
            break
        case 'github-dark':
            import('@uiw/codemirror-theme-github')
                .then(theme => {
                    setSelectedTheme(theme.githubDark)
                })
            break
        case 'xcode-dark':
            import('@uiw/codemirror-theme-xcode')
                .then(theme => {
                    setSelectedTheme(theme.xcodeDark)
                })
            break
        case 'eclipse':
            import('@uiw/codemirror-theme-eclipse')
                .then(theme => {
                    setSelectedTheme(theme.eclipse)
                })
            break
    }
}

export default handleThemeChange