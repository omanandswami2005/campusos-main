module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['web', 'mobile', 'auth', 'canteen', 'printing', 'events', 'database', 'deps', 'ci']],
  },
};
