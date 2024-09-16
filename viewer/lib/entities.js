const THREE = require('three')
const TWEEN = require('@tweenjs/tween.js')

const Entity = require('./entity/Entity')
const { dispose3 } = require('./dispose')
const { createCanvas } = require('canvas')

function getEntityMesh (entity, scene) {
  if (entity.name) {
    try {
      const e = new Entity('1.16.4', entity.name, scene)

      if (entity.username !== undefined) {
        // This sprite needs to accomodate usernames up to 16 characters
        const canvas = createCanvas(500, 100)
        const ctx = canvas.getContext('2d')
        const txt = entity.username
        ctx.font = '20pt monospace'
        ctx.textAlign = 'center'

        const textWidth = ctx.measureText(txt).width 
        const padding = 10 

        // Add a transparent black rectangle around the text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'  
        const rectX = (canvas.width - textWidth - padding * 2) / 2
        ctx.fillRect(rectX, 15, textWidth + padding * 2, 30)  

        // Add username over black rectangle
        ctx.fillStyle = '#FFFFFF' 
        const textX = 90 + (320 / 2) 
        ctx.fillText(txt, textX, 40)

        const tex = new THREE.Texture(canvas)
        tex.needsUpdate = true
        const spriteMat = new THREE.SpriteMaterial({ map: tex })
        const sprite = new THREE.Sprite(spriteMat)
        sprite.scale.set(5, 1, 1)
        sprite.position.y += entity.height + 0.6

        e.mesh.add(sprite)
      }
      return e.mesh
    } catch (err) {
      console.log(err)
    }
  }

  const geometry = new THREE.BoxGeometry(entity.width, entity.height, entity.width)
  geometry.translate(0, entity.height / 2, 0)
  const material = new THREE.MeshBasicMaterial({ color: 0xff00ff })
  const cube = new THREE.Mesh(geometry, material)
  return cube
}

class Entities {
  constructor (scene) {
    this.scene = scene
    this.entities = {}
  }

  clear () {
    for (const mesh of Object.values(this.entities)) {
      this.scene.remove(mesh)
      dispose3(mesh)
    }
    this.entities = {}
  }

  update (entity) {
    if (!this.entities[entity.id]) {
      const mesh = getEntityMesh(entity, this.scene)
      if (!mesh) return
      this.entities[entity.id] = mesh
      this.scene.add(mesh)
    }

    const e = this.entities[entity.id]

    if (entity.delete) {
      this.scene.remove(e)
      dispose3(e)
      delete this.entities[entity.id]
    }

    if (entity.pos) {
      new TWEEN.Tween(e.position).to({ x: entity.pos.x, y: entity.pos.y, z: entity.pos.z }, 50).start()
    }
    if (entity.yaw) {
      const da = (entity.yaw - e.rotation.y) % (Math.PI * 2)
      const dy = 2 * da % (Math.PI * 2) - da
      new TWEEN.Tween(e.rotation).to({ y: e.rotation.y + dy }, 50).start()
    }
  }
}

module.exports = { Entities }
