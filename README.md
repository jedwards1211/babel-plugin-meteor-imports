# babel-plugin-meteor-imports

Simple Babel plugin that allows you to import from Meteor packages in code that isn't processed by isobuild.

For example, it transforms:
```es6
import {Match, check} from 'meteor/check'
```
into:
```es6
const {Match, check} = Package.meteor.check
```
(or similar, depending on other Babel transformations)
