/** Single stroke of a sketch. SVG implementation. */
export default class Path {
  /**
   * @param {string} color - the color of the path
   * @param {number} width - the width of the path
   * @param {object} initialCoords - the sketch that this path is contained in.
   * @param {object} draw - the svg draw object used to render this path.
   */
  constructor(color, width, initialCoords, draw) {
    this.pathCoords = initialCoords  // Flattened array of points, stored as [x1, y1, x2, y2, ...]
    this.randPathCoords = []
    this.svgPath = null
    this.prettyStrokes = []
    this.numPrettyStrokes = 1
    this.prettyStrokesOffset = 0.5

    this.color = color
    this.width = width
    this.draw = draw
    this.options = { width: this.width, color: this.color }

    this.svgPath = this.draw.polyline(initialCoords).fill('none')
        .stroke(this.options)

    let prettyOptions = JSON.parse(JSON.stringify(this.options))
    prettyOptions.opacity = 0.5
    this.prettyOptions = prettyOptions
    for (let i = 0; i < this.numPrettyStrokes; i++) {
      this.prettyStrokes.push(this.draw.polyline([]).fill('none').stroke(prettyOptions))
      this.randPathCoords.push([])
    }
  }

  perturbCoord(coord) {
    return coord + (Math.random() * this.prettyStrokesOffset) * 3
  }

  /**
   * Converts this path into a plain object.
   * @return {object} object containing keys:
   *
   */
  serialize() {
    return {
      coords: this.pathCoords,
      color: this.color,
      width: this.width,
    }
  }

  /**
   *
   * @param {object} serializedPath
   * @param {object} draw
   * @return {Path} the deserialized path
   */
  static deserialize(serializedPath, draw) {
    return new Path(serializedPath.color, serializedPath.width, serializedPath.coords, draw)
  }

  /**
   * Adds a point to the path and renders it.
   *
   * @param {number} x
   * @param {number} y
   */
  addPoint(x, y) {
    this.pathCoords.push(x)
    this.pathCoords.push(y)
    this.svgPath.plot(this.pathCoords)
    for (let i = 0; i < this.numPrettyStrokes; i++) {
      this.randPathCoords[i].push(this.perturbCoord(x))
      this.randPathCoords[i].push(this.perturbCoord(y))
      this.prettyStrokes[i].plot(this.randPathCoords[i])
    }
  }

  /**
   * Stop rendering this path on the SVG.
   */
  remove() {
    this.svgPath.remove()
    for (let prettyStroke of this.prettyStrokes) {
      prettyStroke.remove()
    }
  }

  /**
   * Adds this path to the group so it can be rendered.
   *
   * @param {object} sketchGroup
   */
  addToGroup(sketchGroup) {
    sketchGroup.add(this.svgPath)
    for (let prettyStroke of this.prettyStrokes) {
      sketchGroup.add(prettyStroke)
    }
  }

  pathCoordsAtIndex(coords, index, xy) {
    return coords[index * 2 + xy]
  }

  smoothCoords(coords) {
    let str = ''
    str += ('M ' + this.pathCoordsAtIndex(coords, 0, 0) + ' ' + this.pathCoordsAtIndex(coords, 0, 1) + ' ')
    let skip1 = true
    let skip2 = false
    let cp1x, cp1y, cp2x, cp2y
    for (let i = 0; i < coords.length / 2 - 1; i++) {
      if (skip1) {
        cp1x = this.pathCoordsAtIndex(coords, i, 0) // x
        cp1y = this.pathCoordsAtIndex(coords, i, 1) // y
        skip1 = false
        skip2 = true
      }
      if (skip2) {
        cp2x = this.pathCoordsAtIndex(coords, i, 0) // x
        cp2y = this.pathCoordsAtIndex(coords, i, 1) // y

        skip1 = false
        skip2 = false
      } else {
        str += 'C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' +
          this.pathCoordsAtIndex(coords, i, 0) + ' ' + this.pathCoordsAtIndex(coords, i, 1) + ' '
        skip1 = true
        skip2 = false
      }
    }
    return str
  }

  addToGroupSmoothed(sketchGroup) {
    this.svgPath.remove()
    let path = this.draw.path(this.smoothCoords(this.pathCoords))
        .fill('none')
        .stroke(this.options)
    this.svgPath = path
    sketchGroup.add(path)

    for (let i = 0; i < this.numPrettyStrokes; i++) {
      let prettyStroke = this.prettyStrokes[i]
      let coords = this.randPathCoords[i]
      prettyStroke.remove()
      let prettyPath = this.draw.path(this.smoothCoords(coords))
          .fill('none')
          .stroke(this.prettyOptions)
      this.prettyStrokes[i] = prettyPath
      sketchGroup.add(prettyPath)
    }
  }
}
