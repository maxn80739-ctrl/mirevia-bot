const ROLES_AUTORISES = [
  '1509491929614647438',
  '1509491929614647435',
  '1509491929614647434',
];

function aLeRole(member) {
  return member.roles.cache.some(r => ROLES_AUTORISES.includes(r.id));
}

module.exports = { aLeRole };