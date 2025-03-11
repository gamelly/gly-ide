import { editor, KeyMod, KeyCode, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import * as jslang from 'monaco-editor/esm/vs/basic-languages/javascript/javascript'
import * as tslang  from 'monaco-editor/esm/vs/basic-languages/typescript/typescript'
import * as lualang from 'monaco-editor/esm/vs/basic-languages/lua/lua'

export class VsCode {
  private ide: editor.IStandaloneCodeEditor
  private el_btn_apply = document.querySelector('#btn-play') as HTMLElement
  private handler_update = (s: string) => {}

  private createEditor(): editor.IStandaloneCodeEditor {
    return editor.create(document.querySelector('#editor') as HTMLElement, {
      language: 'lua',
      theme: 'vs-dark',
      automaticLayout: true,
      fontLigatures: true,
      fontFamily: 'Cascadia Code'
    });
  }

  private addLanguage(id: string, lang: languages.IMonarchLanguage, cfg: typeof languages) {
    cfg.register({ id })
    cfg.setMonarchTokensProvider(id, {
        ...lang.language,
        tokenizer: {
            ...lang.language.tokenizer,
            root: [...lang.language.tokenizer.root, [/[{}\[\]();,.]/, 'delimiter']]
        }
    })
    cfg.setLanguageConfiguration('lua', lang.conf)
  }

  constructor() {
    this.ide = this.createEditor()
    this.addLanguage('lua', lualang, languages)
    this.addLanguage('javascript', jslang, languages)
    this.addLanguage('typescript', tslang, languages)
    this.el_btn_apply.addEventListener('click',  () => this.handler_update(this.ide.getValue()))
  }

  public bindUpdate(func: (script: string) => void) {
    this.handler_update = func
    this.ide.addAction({
        id: 'run-game',
        label: 'running game',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyE],
        run: () => this.handler_update(this.ide.getValue())
    })
  }

  public editor(): editor.IStandaloneCodeEditor {
    return this.ide
  }
}
