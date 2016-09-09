import {transform} from 'babel-core'
import {expect} from 'chai'

const options = {
  presets: ['es2015'],
  plugins: ['./lib/index.js'],
}

describe('babel-plugin-meteor-imports', () => {
  it('transforms require statements correctly', () => {
    const {code} = transform("const {Match, check} = require('meteor/check')", options)
    expect(eval(`(function() {
      const Package = {check: {Match: 5, check: 10}}
      ${code}
      return {Match: Match, check: check} 
    })()`)).to.deep.equal({Match: 5, check: 10})
  })
  it("doesn't transform non-meteor require statements", () => {
    const {code} = transform("require('test')", options)
    expect(code).to.equal(`'use strict';

require('test');`)
  })
  it('transforms single import statements correctly', () => {
    const {code} = transform("import {Match} from 'meteor/check'", options)
    expect(eval(`(function() {
      const Package = {check: {Match: 5}}
      ${code}
      return {Match: Match}
    })()`)).to.deep.equal({Match: 5})
  })
  it('transforms multi import statements correctly', () => {
    const {code} = transform("import {Match, check} from 'meteor/check'", options)
    expect(eval(`(function() {
      const Package = {check: {Match: 5, check: 10}}
      ${code}
      return {Match: Match, check: check}
    })()`)).to.deep.equal({Match: 5, check: 10})
  })
  it("doesn't allow default imports from meteor pacakges", () => {
    expect(() => transform("import check from 'meteor/check'", options)).to.throw
  })
  it('works for packages with dashes in the name', () => {
    const {code} = transform("import {Accounts} from 'meteor/accounts-base'", options)
    /* eslint-disable no-console */
    /* eslint-disable no-undef */
    console.log(code)
    expect(eval(`(function() {
      const Package = {'accounts-base': {Accounts: 5}}
      ${code}
      return {Accounts: Accounts}
    })()`)).to.deep.equal({Accounts: 5})
  })
})
