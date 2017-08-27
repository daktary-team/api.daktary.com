# api.daktary.com

[![Build Status](https://travis-ci.org/daktary-team/api.daktary.com.svg?branch=master)](https://travis-ci.org/daktary-team/api.daktary.com)

## Installation

### Rate limit policies

For requests using Basic Authentication or OAuth, you can make up to 5,000 requests per hour.  
For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. - Github

Read Github instructions to understand the rate limit policies :  
[rate-limit-for-oauth-applications](https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications)

## Deploy on Heroku

```bash
$ heroku config:get GITHUB_ID=xxxx
$ heroku config:get GITHUB_SECRET=yyyy
$ touch .env
$ heroku config:get GITHUB_ID -s  >> .env
$ heroku config:get GITHUB_SECRET -s  >> .env
```

### Start daktary-api locally

```bash
heroku local web
```

Then [http://localhost:5000](http://localhost:5000)

[cf. Generator](https://github.com/DrkSephy/es6-cheatsheet)
