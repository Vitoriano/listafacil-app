// Ensure NODE_ENV is 'test' so React loads its development build (which includes act()).
// Without this, babel-preset-expo's metro caller inlines NODE_ENV='production' 
// into transformed files, which causes React to load its production build (no act()).
'use strict';
process.env.NODE_ENV = 'test';
