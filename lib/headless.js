/* global THREE */
function safeRequire (path) {
  try {
    return require(path)
  } catch (e) {
    return {}
  }
}
global.THREE = require('three')
global.Worker = require('worker_threads').Worker
const { createCanvas } = safeRequire('node-canvas-webgl/lib')

const { WorldView, Viewer } = require('../viewer')

let latestFrameBuffer = null;

module.exports = (bot, { viewDistance = 6, width = 512, height = 512 }) => {
  const canvas = createCanvas(width, height)
  const renderer = new THREE.WebGLRenderer({ canvas })
  const viewer = new Viewer(renderer)

  if (!viewer.setVersion(bot.version)) {
    return false
  }
  viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)

  // Load world
  const worldView = new WorldView(bot.world, viewDistance, bot.entity.position)
  viewer.listen(worldView)
  worldView.init(bot.entity.position)

  // Render loop 
  let fps = 24;
  update(fps);

  function update (fps) {
    viewer.update()
    renderer.render(viewer.scene, viewer.camera)
    latestFrameBuffer = canvas.toBuffer('image/jpeg')
    setTimeout(update, Math.round(1000/fps)) 
  }

  // Register event listeners
  function botPosition () {
    viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)
    worldView.updatePosition(bot.entity.position)
  }

  bot.on('move', botPosition)
  worldView.listenToBot(bot)

  return {
    getLatestFrame: () => latestFrameBuffer
  };
}
