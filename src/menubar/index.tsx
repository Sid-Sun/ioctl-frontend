import { Fragment, useState } from "react"
import { environment } from "../environment"

interface menubarProps {
  font: {
    fontSize: number
    setFontSize: (atg0: number) => void
  }
  wrapLine: {
    wrapLine: boolean
    setWrapLine: (arg0: boolean) => void
  }
  theme: {
    theme: string
    setTheme: (arg0: string) => void
  }
  language: {
    language: string
    setLanguage: (arg0: string) => void
  }
  ephemeral: {
    ephemeral: boolean
    setEphemeral: (arg0: boolean) => void
  }
  useE2EE: {
    useE2EE: boolean
    setUseE2EE: (arg0: boolean) => void
  }
  id?: string
  save: () => void
  duplicateAndEdit: () => void
  loading: boolean
  readOnly: boolean
  showBranding: boolean
  alert: string
}

function MenuBar(props: menubarProps) {
  let [enableAllLanguages, setEnableAllLanguages] = useState<boolean>(false)
  let { theme, setTheme } = props.theme
  let { fontSize, setFontSize } = props.font
  let { language, setLanguage } = props.language
  let { wrapLine, setWrapLine } = props.wrapLine
  let { ephemeral, setEphemeral } = props.ephemeral
  let { useE2EE, setUseE2EE } = props.useE2EE

  return (
    <Fragment>
      <div className="bg-gray-800 text-white h-screen">
        {props.showBranding && <div className="p-8 bg-purple-800">
          <a className="font-mono text-center text-2xl block" href="/">i/o/ctl</a>
        </div>}
        <div>
          <h4 className="font-mono text-center text-xl pb-4 pt-6">Editor Options</h4>
          <div className="items-center px-8">
            <label htmlFor="theme" className="text-center font-mono pb-2">Theme:</label>
            <select id="theme" value={theme} onChange={e => setTheme(e.target.value)} className="form-select appearance-none block w-full px-1 py-0.5 text-base font-mono text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out mx-0 mt-0.5 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none">
              <option value="duotone-dark">Duotone Dark</option>
              <option value="github-dark">Github Dark</option>
              <option value="xcode-dark">Xcode Dark</option>
              <option value="eclipse">Eclipse Light</option>
            </select>
          </div>
          <div className="px-8 mt-1">
            <label htmlFor="fontSize" className="text-center font-mono">Font Size</label>
            <br />
            <input onChange={e => setFontSize(parseInt(e.target.value))} value={fontSize} type="range" id="fontSize" max="26" min="10" step="1" className="w-full form-check-input" />
          </div>
          <div className="items-stretch form-check px-8 mt-1">
            <input checked={wrapLine} onChange={() => setWrapLine(!wrapLine)} type="checkbox" id="wordwrap" className="form-check-input" />
            <label htmlFor="wordwrap" className="text-center font-mono pl-2">Wrap Text</label>
          </div>
          <div className="items-stretch form-check px-8 mt-1 pb-3">
            <input checked={useE2EE} onChange={() => setUseE2EE(!useE2EE)} type="checkbox" id="useE2EE" className="form-check-input" />
            <label htmlFor="useE2EE" className="text-center font-mono pl-2">Use E2EE</label>
          </div>
          <h4 className="font-mono text-center text-xl py-4">Snippet Options</h4>
          <div className="items-center form-check pb-0 px-8">
            <input disabled={props.loading} checked={enableAllLanguages} onChange={() => setEnableAllLanguages(!enableAllLanguages)} type="checkbox" id="showAll" className="form-check-input" />
            <label htmlFor="showAll" className="text-center font-mono pl-2">Show All Languages</label>
          </div>
          <div className="items-center px-8 mt-0">
            <label htmlFor="language" className="text-center font-mono pb-2">Language:</label>
            <select disabled={props.loading} value={language} onChange={e => setLanguage(e.target.value)} id="language" className="form-select appearance-none block w-full px-1 py-0.5 text-base font-mono text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out mx-0 mt-0.5 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none">
              <option value="cpp">c++</option>
              {enableAllLanguages && <option value="dockerfile">dockerfile</option>}
              <option value="go">go</option>
              {enableAllLanguages && <option value="html">html</option>}
              {enableAllLanguages && <option value="java">java</option>}
              <option value="javascript">javascript</option>
              {enableAllLanguages && <option value="jinja2">jinja2</option>}
              {enableAllLanguages && <option value="json">json</option>}
              <option value="markdown">markdown</option>
              <option value="plaintext">plaintext</option>
              <option value="python">python</option>
              {enableAllLanguages && <option value="rust">rust</option>}
              {enableAllLanguages && <option value="swift">swift</option>}
              {enableAllLanguages && <option value="toml">toml</option>}
              {enableAllLanguages && <option value="xml">xml</option>}
              {enableAllLanguages && <option value="yaml">yaml</option>}
            </select>
          </div>
          <div className="items-stretch form-check px-8 py-3">
            <input disabled={props.readOnly || props.loading} checked={ephemeral} onChange={() => setEphemeral(!ephemeral)} type="checkbox" id="ephemeral" className="form-check-input" />
            <label htmlFor="ephemeral" className="text-center font-mono pl-2">Save Temporarily</label>
          </div>
          <div className="flex space-x-2 justify-center">
            {!props.readOnly && <button disabled={props.loading} onClick={props.save} className="inline-block w-5/6 px-6 py-2.5 bg-purple-800 text-white font-medium text-xs leading-tight uppercase rounded shadow-lg hover:bg-purple-700 hover:shadow-lg focus:bg-purple-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
              <p>Save</p>
            </button>}
            {props.readOnly && <button disabled={props.loading} onClick={props.duplicateAndEdit} type="button" className="inline-block w-5/6 px-6 py-2.5 bg-purple-800 text-white font-medium text-xs leading-tight uppercase rounded shadow-lg hover:bg-purple-700 hover:shadow-lg focus:bg-purple-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" >
              Duplicate and Edit
            </button>}
          </div>
        </div>
        {props.id && <div className="flex space-x-2 justify-center mt-3">
          <a type="button" href={environment.APIBaseURL + "r/" + props.id} className="inline-block w-5/6 px-6 py-2.5 bg-pink-700 text-center text-white font-medium text-xs leading-tight uppercase rounded shadow-lg hover:bg-purple-700 hover:shadow-lg focus:bg-purple-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out" >
            raw
          </a>
        </div>}
        {(props.alert !== '') &&
          <div className="my-3 mx-8 py-2 px-5 bg-gray-300 text-gray-900 rounded-md text-sm border border-gray-400 flex" >
            <span>{props.alert}</span>
          </div>}
        <div>
          <a className="font-mono text-center text-l mt-4 mb-3 cursor-pointer block" href="/About">ℹ️ About</a>
          <a className="font-mono text-center text-l my-3  cursor-pointer block" href="https://github.com/fitant" target="_blank">GitHub</a>
          <a className="font-mono text-center text-l my-3 cursor-pointer block" href="/PrivacyPolicy">Privacy Policy</a>
        </div>
      </div>
    </Fragment>
  )
}

export default MenuBar