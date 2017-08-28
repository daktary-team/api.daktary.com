const config = {}

/**
 * To understand authentification rate limit policy, please read Github instructions :
 * > https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
 */
config.ghSecret = process.env.GITHUB_SECRET
config.ghId = process.env.GITHUB_ID

module.exports = config
