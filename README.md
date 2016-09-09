# babel-plugin-meteor-imports

[![Build Status](https://travis-ci.org/jedwards1211/babel-plugin-meteor-imports.svg?branch=master)](https://travis-ci.org/jedwards1211/babel-plugin-meteor-imports)

Simple Babel plugin that allows you to import from Meteor packages in code that isn't processed by isobuild.
(But it assumes you've loaded the packages by requiring `boot.js` from `.meteor/local/build/programs/server`.)

For example, it transforms:
```es6
import {Match, check} from 'meteor/check'
```
into:
```es6
const {Match, check} = Package.meteor.check
```
(or similar, depending on other Babel transformations)
