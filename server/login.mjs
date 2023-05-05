//https://www.taniarascia.com/basic-authentication-for-an-express-node-app-htpasswd/

import auth from 'basic-auth'

const admin = { name: 'username', password: 'password' }

export function login (request, response, next) {
  var user = auth(request)
  if (!user || !admin.name || admin.password !== user.pass) {
    response.set('WWW-Authenticate', 'Basic realm="example"')
    return response.status(401).send()
  }
  return next()
}