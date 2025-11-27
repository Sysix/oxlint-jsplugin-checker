import unicorn from 'eslint-plugin-unicorn';

export default {
  ...unicorn,
  meta: {
    ...unicorn.meta,
    name: 'eslint-plugin-reserved-unicorn',
  },
};