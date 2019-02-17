import { create } from 'src/util/underscore'
import { stringify } from 'src/util/underscore'
import assert from 'src/util/assert'
import ITagImpl from './itag-impl'
import ITagImplOptions from './itag-impl-options'
import Liquid from 'src/liquid'
import Hash from './hash'
import Template from 'src/template/template'
import ITemplate from 'src/template/itemplate'
import TagToken from 'src/parser/tag-token'

export default class Tag extends Template implements ITemplate {
  name: string
  token: TagToken
  private impl: ITagImpl
  static impls: object = {}

  constructor (token, tokens, liquid: Liquid) {
    super(token)
    this.name = token.name

    const impl = Tag.impls[token.name]
    assert(impl, `tag ${token.name} not found`)
    this.impl = create(impl)
    this.impl.liquid = liquid
    if (this.impl.parse) {
      this.impl.parse(token, tokens)
    }
  }
  async render (scope) {
    const hash = new Hash(this.token.args, scope)
    const impl = this.impl
    if (typeof impl.render !== 'function') {
      return ''
    }
    const html = await impl.render(scope, hash)
    return stringify(html)
  }
  static register (name: string, tag: ITagImplOptions) {
    Tag.impls[name] = tag
  }
  static clear () {
    Tag.impls = {}
  }
}