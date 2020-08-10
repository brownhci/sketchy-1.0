import nameFromId from './namegenerator'


function randString(length) {
  let validCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let result = ''
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * validCharacters.length)
    result = result + validCharacters.charAt(index)
  }
  return result
}


export default class Util {
  static getUserId() {
    // let userId = this.environmentIsProduction() ? localStorage.getItem('userId') : sessionStorage.getItem('userId')
    let userId = sessionStorage.getItem('userId')
    if (userId == null) {
      userId = randString(10)
      localStorage.setItem('userId', userId)
      sessionStorage.setItem('userId', userId)
    }
    return userId
  }

  static getUsername() {
    return nameFromId(this.getUserId())
  }

  static environmentIsProduction() {
    return process.env.NODE_ENV === 'production'
  }
}

