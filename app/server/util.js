const model = require('./dbmodel')

function printUserList (userList) {
  for (let user of userList) {
    console.log(' -- ' + user.userId)
  }
}

function remove (list, element) {
  let index = list.indexOf(element)
  if (index > -1) {
    list.splice(index, 1)
  } else {
    throw 'Could not find'
  }
}

async function saveInteraction (user, interaction, data) {
  data = data === undefined ? {} : data
  let interactionDocument = await model.Interaction.create({
    userId: user.userId,
    room: user.roomName,
    interactionType: interaction,
    sketch: user.sketch,
    interactionData: data
  })
  // console.log('[interaction saved] ' + interaction)
  try {
    user.document.interactions.push(interactionDocument)
    user.document.finalSketch = user.sketch
    await Promise.all([
      user.lock.acquire('key', () => user.document.save()),
      user.room.lock.acquire('key', () => user.room.document.save())])
  } catch (saveErr) {
    console.log('could not save document')
    console.log(saveErr)
  }
  return interactionDocument
}

module.exports = { remove, saveInteraction }
