/** A collection of path. Keeps track of a undo and redo buffer. */
import Path from './path'

export default class Sketch {
  /**
   * @param {object} draw - the SVG draw object
   * @param {object} svg - the svg element
   */
  constructor(draw, svg) {
    // this.paths = []
    this.clearedSketches = [[]] // Stores current sketch and all cleared sketches for undoing and redoing clears.
    this.sketchGroup = draw.group()
    this.draw = draw
    this.currentPath = null
    this.undoIndex = 0
    this.clearUndoIndex = 0
    this.svg = svg

    this.originalWidth = this.getWidth()
    this.originalHeight = this.getHeight()
    this.updateDimensions()
  }

  getPaths() {
    return this.clearedSketches[this.clearedSketches.length - this.clearUndoIndex - 1]
  }

  setPaths(newPaths) {
    this.clearedSketches[this.clearedSketches.length - this.clearUndoIndex - 1] = newPaths
  }

  getWidth() {
    let sketchpad = document.getElementById('sketchpad')
    if (sketchpad !== null) {
      return sketchpad.clientWidth
    }
    return this.svg.clientWidth
  }

  getHeight() {
    let sketchpad = document.getElementById('sketchpad')
    if (sketchpad !== null) {
      return sketchpad.clientHeight
    }
    return this.svg.clientHeight
  }

  /**
   * Serialize a path into an array of objects
   * @return {Array}
   */
  serialize() {
    let serialized = []
    let paths = this.getPaths()
    for (let i = 0; i < paths.length - this.undoIndex; i++) {
      serialized.push(paths[i].serialize())
    }
    return serialized
  }

  /**
   * Loads in a serialized sketch.
   * @param {Object} serializedSketch
   */
  loadSketch(serializedSketch) {
    this.remove()
    this.setPaths([])
    for (let serializedPath of serializedSketch) {
      let path = Path.deserialize(serializedPath, this.draw)
      this.getPaths().push(path)
    }
  }

  displayLoadedSketch(scaleSketch) {
    scaleSketch = scaleSketch === undefined ? true : scaleSketch
    this.sketchGroup.remove()
    this.sketchGroup = this.draw.group()
    if (!scaleSketch) {
      this.updateDimensions()
    }

    for (let path of this.getPaths()) {
      path.addToGroupSmoothed(this.sketchGroup)
    }
    let width = this.getWidth()
    let height = this.getHeight()

    if (!scaleSketch) {
      return
    }

    // scale snooped sketch to fit.
    let bbox = this.sketchGroup.bbox()

    let snoopHeight = height
    let votebar = document.getElementById('votebar')
    if (votebar !== null) {
      snoopHeight = snoopHeight - votebar.getClientRects()[0].height
    }
    let scale = Math.min(width / bbox.width, snoopHeight / bbox.height)

    this.sketchGroup.transform({ // Center peeked sketch
      x: width / 2 - bbox.cx,
      y: snoopHeight / 2 - bbox.cy,
      relative: true,
    })
    this.sketchGroup.transform({
      scaleX: scale * 0.8, // Include some padding
      scaleY: scale * 0.8,
    })
  }

  /**
   * Reset the origin to the center of image and scale sketch to fit screen, assuming it fit in original width and
   * height.
   */
  updateDimensions() {
    let xScaleFactor = (this.getWidth() / this.originalWidth)
    let yScaleFactor = (this.getHeight() / this.originalHeight)

    this.updateOrigin()
    let scaleFactor = Math.min(xScaleFactor, yScaleFactor)

    this.sketchGroup.transform({
      scale: scaleFactor,
      cx: 0,
      cy: 0,
    })
  }

  updateOrigin() {
    this.sketchGroup.transform({
      scale: 1,
    })
    this.sketchGroup.transform({
      x: this.getWidth() / 2,
      y: this.getHeight() / 2,
    })
  }

  undo() {
    if (this.undoIndex < this.getPaths().length) {
      let targetPath = this.getPaths()[this.getPaths().length - this.undoIndex - 1]
      targetPath.remove()
      this.undoIndex += 1
    } else if (this.clearUndoIndex < this.clearedSketches.length - 1) { // Undoing a clear
      this.undoIndex = 0
      this.clearUndoIndex += 1

      for (let path of this.getPaths()) {
        path.addToGroup(this.sketchGroup)
      }
    } else {
      return false
    }
    return true
  }

  redo() {
    if (this.undoIndex > 0) {
      let targetPath = this.getPaths()[this.getPaths().length - this.undoIndex]
      targetPath.addToGroup(this.sketchGroup)
      this.undoIndex -= 1
    } else if (this.clearUndoIndex > 0) {
      this.remove()
      this.clearUndoIndex -= 1
      this.undoIndex = this.getPaths().length
    } else {
      return false
    }
    return true
  }

  clear() {
    if (this.getPaths().length === 0) {
      return false
    }
    this.setPaths(this.getPaths().slice(0, this.getPaths().length - this.undoIndex))
    this.clearedSketches = this.clearedSketches.slice(0, this.clearedSketches.length - this.clearUndoIndex)
    this.clearUndoIndex = 0
    this.undoIndex = 0
    this.remove()
    this.clearedSketches.push([])
    return true
  }

  remove() {
    this.sketchGroup.remove()
    this.sketchGroup = this.draw.group()
    this.updateDimensions()
  }

  hide() {
    this.sketchGroup.hide()
  }

  show() {
    this.sketchGroup.show()
  }

  /**
   * Adds a point onto the current
   * @param {object} event
   */
  continueLineWithEvent(event) {
    let rect = this.svg.getBoundingClientRect()
    if (event.type.startsWith('touch')) {
      event = event.changedTouches[0]
    }

    // Transform coordinates on svg div to center origin coordinates of sketchGroup
    let transform = this.sketchGroup.transform()
    let x = ((event.clientX - rect.left) - transform.x) / transform.scaleX
    let y = ((event.clientY - rect.top) - transform.y) / transform.scaleY
    this.currentPath.addPoint(x, y)
  }

  /**
   *
   * @param {string} color
   * @param {number} width
   */
  startPath(color, width) {
    this.currentPath = new Path(color, width, [], this.draw)
    this.currentPath.addToGroup(this.sketchGroup)
  }

  /**
   * Adds the current path to the list of other paths.
   */
  finishPath() {
    this.setPaths(this.getPaths().slice(0, this.getPaths().length - this.undoIndex))
    this.getPaths().push(this.currentPath)
    this.clearedSketches = this.clearedSketches.slice(0, this.clearedSketches.length - this.clearUndoIndex)
    this.undoIndex = 0
    this.clearUndoIndex = 0
    this.currentPath.addToGroupSmoothed(this.sketchGroup)
    this.currentPath = null
  }
}
