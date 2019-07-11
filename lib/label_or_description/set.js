var wait=1000;
const validateArgs = require('./validate_args')

module.exports = (name) => (config) => {
  const { post } = require('../request')(config)
  const { Log, LogError } = require('../log')(config)
  return (entity, language, value, Proceed) => {
    return validateArgs(entity, language, name, value)
    .then(() => {
      return post(`wbset${name}`, {
        id: entity,
        language,
        value,
        assert: 'bot',
		bot: 1
      })
    })
    .then(function(){(console.log("Log Res called"),Log(`set ${name} res (${entity}:${language}:${value})`),setTimeout(Proceed, 1000),console.log("Timeout set"))})
    .catch(function(){(setTimeout(Proceed, 1000,"e"),LogError(`set ${name} err (${entity}:${language}:${value})`))})
  }
}
