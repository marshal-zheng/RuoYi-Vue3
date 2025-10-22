import { Graph } from '@antv/x6'
import { Curve, Path } from '@antv/x6-geometry'
import { register } from '@antv/x6-vue-shape'
import DagNode from './DagNode.vue'
import { PORT_GROUPS } from '../constants/portConfig.js'

export const DAG_NODE = 'dag-node'
export const DAG_EDGE = 'dag-edge'
export const DAG_CONNECTOR = 'dag-connector'

let registered = false

export const registerDagShapes = () => {
  if (registered) {
    return
  }

  register({
    shape: DAG_NODE,
    width: 180,
    height: 36,
    component: DagNode,
    effect: ['data'],
    attrs: {
      body: {
        width: 180,
        height: 36
      }
    },
    ports: {
      groups: PORT_GROUPS
    }
  })

  Graph.registerConnector(
    DAG_CONNECTOR,
    (sourcePoint, targetPoint, routePoints = [], options = {}) => {
      if (routePoints && routePoints.length > 0) {
        const points = [sourcePoint, ...routePoints, targetPoint]
        const curves = Curve.throughPoints(points)
        const path = new Path(curves)
        return options.raw ? path : path.serialize()
      }

      const offset = 4
      const deltaY = Math.abs(targetPoint.y - sourcePoint.y)
      const deltaX = Math.abs(targetPoint.x - sourcePoint.x)
      const isHorizontal = deltaX > deltaY

      const path = new Path()
      path.appendSegment(Path.createSegment('M', sourcePoint))

      if (isHorizontal) {
        const control = Math.floor((deltaX / 3) * 2)
        path.appendSegment(
          Path.createSegment('L', {
            x: sourcePoint.x + offset,
            y: sourcePoint.y
          })
        )
        path.appendSegment(
          Path.createSegment(
            'C',
            {
              x: sourcePoint.x + offset + control,
              y: sourcePoint.y
            },
            {
              x: targetPoint.x - offset - control,
              y: targetPoint.y
            },
            {
              x: targetPoint.x - offset,
              y: targetPoint.y
            }
          )
        )
        path.appendSegment(Path.createSegment('L', targetPoint))
      } else {
        const control = Math.floor((deltaY / 3) * 2)
        path.appendSegment(
          Path.createSegment('L', {
            x: sourcePoint.x,
            y: sourcePoint.y + offset
          })
        )
        path.appendSegment(
          Path.createSegment(
            'C',
            {
              x: sourcePoint.x,
              y: sourcePoint.y + offset + control
            },
            {
              x: targetPoint.x,
              y: targetPoint.y - offset - control
            },
            {
              x: targetPoint.x,
              y: targetPoint.y - offset
            }
          )
        )
        path.appendSegment(Path.createSegment('L', targetPoint))
      }

      return options.raw ? path : path.serialize()
    },
    true
  )

  Graph.registerEdge(
    DAG_EDGE,
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#C2C8D5',
          strokeWidth: 2,
          targetMarker: null
        }
      },
      zIndex: -1
    },
    true
  )

  registered = true
}
