import React from 'react';
import axios from 'axios';
import { Extension } from "@codemirror/state";
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useRef, useState } from 'react';
import { EditorView, ViewUpdate } from "@codemirror/view";
import { useNavigate, useParams } from "react-router-dom";
import { duotoneDark } from '@uiw/codemirror-theme-duotone';

import './App.css';

import MenuBar from './menubar'

import getFontSizeThemeExtension from './fonts'
import useWindowDimensions from './dimensions';
import { handleLanguageChange, handleThemeChange } from './dynamic-loader';
// TODO: Chunk Loading for Crypto
import { aeadDecrypt, aeadEncrypt, CryptoStack, generateEncryptionStack, getSnippetUUID, SnippetSpecModel } from './crypto/crypto';
import { environment } from './environment';

function App() {
  const navigate = useNavigate()
  let params = useParams();
  let [editorWidth, setEditorWidth] = useState<number>(0)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  let [readOnly, setReadOnly] = useState<boolean>(false)
  let [loading, setLoading] = useState<boolean>(false)
  let [alert, setAlert] = useState<string>('')
  let [dismisser, setDismisser] = useState<NodeJS.Timeout | undefined>()
  // Editor State Properties 
  // TODO: Load and save to browser localStorage
  let [wrapLine, setWrapLine] = useState<boolean>(localStorage.getItem('wrapline') === "no" ? false : true)
  // @ts-ignore -- needed as TS thinks second localStorage.getItem() call would return null but it won't due to ternary
  let [fontSize, setFontSize] = useState<number>(localStorage.getItem('fontsize') === null ? 16 : parseInt(localStorage.getItem('fontsize')))
  // @ts-ignore -- needed as TS thinks second localStorage.getItem() call would return null but it won't due to ternary 
  let [theme, setTheme] = useState<string>(localStorage.getItem('theme') === null ? "duotone-dark" : localStorage.getItem('theme')) // stores name of theme
  let [selectedTheme, setSelectedTheme] = useState<Extension>(duotoneDark) // stores theme extenstion
  // Snippet State Properties
  let [ephemeral, setEphemeral] = useState<boolean>(true)
  let [language, setLanguage] = useState<string>("plaintext")
  let [document, setDocument] = useState<string>("")
  let [selectedLanguage, setSelectedLanguage] = useState<Extension | undefined>()
  let [ephCryptoStack, setEphCryptoStack] = useState<Promise<CryptoStack> | undefined>(undefined)
  let [nonEphCryptoStack, setNonEphCryptoStack] = useState<Promise<CryptoStack> | undefined>(undefined)

  useEffect(() => {
    localStorage.setItem('theme', theme)
    localStorage.setItem('fontsize', fontSize.toString())
    localStorage.setItem('wrapline', wrapLine ? "yes" : "no")
  }, [wrapLine, fontSize, theme])

  // start generation of non-eph crypto stack if ephemeral is changed to false
  // we don't generate both by default to save compute an prevent slowdown
  useEffect(() => {
    if (ephemeral) {
      if (ephCryptoStack === undefined) {
        setEphCryptoStack(generateEncryptionStack(true))
      }
    }
    if (!ephemeral) {
      if (nonEphCryptoStack === undefined) {
        setNonEphCryptoStack(generateEncryptionStack(false))
      }
    }
  }, [ephemeral, ephCryptoStack, nonEphCryptoStack])

  useEffect(() => {
    if (alert === "") {
      return
    }
    if (dismisser !== undefined) {
      clearTimeout(dismisser)
    }
    setDismisser(setTimeout(() => {
      setAlert('')
    }, 5000))
  }, [alert])

  const getExtensions = () => {
    let extensions: Extension[] = [getFontSizeThemeExtension(fontSize)]
    if (wrapLine) {
      extensions.push(EditorView.lineWrapping)
    }
    switch (language) {
      case 'plaintext':
        break
      default:
        if (selectedLanguage) {
          extensions.push(selectedLanguage)
        }
    }
    return extensions
  }

  useEffect(() => {
    handleLanguageChange(language, setSelectedLanguage)
  }, [language]) // runs only on language change

  useEffect(() => {
    handleThemeChange(theme, setSelectedTheme)
  }, [theme]) // only runs when theme changes

  useEffect(() => {
    if (editorContainerRef.current) {
      setEditorWidth(editorContainerRef.current.offsetWidth)
    }
  }) // runs continuously to ensure editor is full sized

  const checkIfEphemeral = (id: string): boolean => {
    return (id.match(/[A-Z]/g) || []).length === 2
  }

  useEffect(() => {
    if (params.id && document === "") {
      setReadOnly(true)
      setLoading(true)
      // load snippet
      setAlert("generating crypto stack")
      getSnippetUUID(params.id).then(uuid => {
        setAlert("downloading snippet")
        // @ts-ignore
        axios.get<SnippetSpecModel>(environment.S3BaseURL + (checkIfEphemeral(params.id) ? "ephemeral/" + uuid : uuid)).then(snippetSpec => {
          setAlert("decrypting")
          // @ts-ignore
          aeadDecrypt(snippetSpec.data, params.id).then(snippet => {
            setDocument(snippet.data)
            setEphemeral(snippet.metadata.ephemeral)
            setLanguage(snippet.metadata.language)
            setLoading(false)
          })
        }).catch(e => {
          setAlert(JSON.stringify(e.code))
          console.log(e)
          setTimeout(() => {
            onDuplicateAndEdit()
          }, 5000)
        })
      })
    }
  }, [params]) // used to load snippet if param 'id' is present


  const onSave = () => {
    if (document === "" || document === "cannot save empty snippet!") {
      setAlert("cannot save empty snippet!")
      return
    }
    setLoading(true)
    setAlert("generating crypto stack");
    (ephemeral ? ephCryptoStack : nonEphCryptoStack)?.then(stack => {
      setAlert("encypting")
      aeadEncrypt({
        data: document,
        metadata: {
          id: stack.snippetID,
          language: language,
          ephemeral: ephemeral
        }
      }, stack).then(snippetSpec => {
        setAlert("saving")
        axios.post(environment.APIBaseURL + "e2e/" + stack.uuid, snippetSpec, {
          headers: {
            'Ephemeral': ephemeral
          }
        }).then(() => {
          navigate('/' + stack.snippetID, { replace: true })
          setAlert("saved")
          setReadOnly(true)
          setLoading(false)
        }).catch(e => {
          setLoading(false)
          setAlert(JSON.stringify(e.code))
          console.log(e)
        })
      })
    })
  }

  const onDuplicateAndEdit = () => {
    setEphCryptoStack(undefined)
    setNonEphCryptoStack(undefined)
    setReadOnly(false)
    navigate("..")
  }

  const onDocumentChange = React.useCallback((value: string, viewUpdate: ViewUpdate) => {
    setDocument(value)
  }, []);

  return (
    <div className="flex">
      <div className="md:w-2/3 lg:w-3/4 xl:w-4/5 w-screen" ref={editorContainerRef} >
        <CodeMirror
          autoFocus={true}
          value={document}
          readOnly={readOnly || loading}
          theme={selectedTheme}
          extensions={getExtensions()}
          height={(useWindowDimensions().height).toString() + 'px'}
          width={(editorWidth).toString() + 'px'}
          onChange={onDocumentChange}
        />
      </div>
      <div className='md:block md:w-1/3 lg:w-1/4 xl:w-1/5 hidden'>
        <MenuBar duplicateAndEdit={onDuplicateAndEdit} id={readOnly ? params.id : undefined} alert={alert} loading={loading} readOnly={readOnly} save={onSave} ephemeral={{ ephemeral, setEphemeral }} language={{ language, setLanguage }} theme={{ theme, setTheme }} font={{ fontSize, setFontSize }} wrapLine={{ wrapLine, setWrapLine }} />
      </div>
    </div>
  );
}

export default App;
