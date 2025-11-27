import jsdoc from 'eslint-plugin-jsdoc';

export default {
  ...jsdoc,
  meta: {
    ...jsdoc.meta,
    name: 'eslint-plugin-reserved-jsdoc',
  },
};