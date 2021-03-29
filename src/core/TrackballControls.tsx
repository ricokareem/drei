import * as React from 'react'
import { ReactThreeFiber, Performance, useThree, useFrame } from '@react-three/fiber'
import { TrackballControls as TrackballControlsImpl } from 'three-stdlib'
import shallow from 'zustand/shallow'

export type TrackballControls = ReactThreeFiber.Overwrite<
  ReactThreeFiber.Object3DNode<TrackballControlsImpl, typeof TrackballControlsImpl>,
  {
    target?: ReactThreeFiber.Vector3
    camera?: THREE.Camera
    regress?: boolean
  }
>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      trackballControlsImpl: TrackballControls
    }
  }
}

export const TrackballControls = React.forwardRef<TrackballControlsImpl, TrackballControls>((props, ref) => {
  const { camera, regress, ...rest } = props
  const { camera: defaultCamera, gl, invalidate, performance } = useThree(
    ({ camera, gl, invalidate, performance }) => ({
      camera,
      gl,
      invalidate,
      performance,
    }),
    shallow
  )
  const explCamera = camera || defaultCamera
  const [controls] = React.useState(() => new TrackballControlsImpl(explCamera, gl.domElement))

  useFrame(() => controls.update())
  React.useEffect(() => {
    const callback = () => {
      invalidate()
      if (regress) performance.regress()
    }
    controls?.addEventListener?.('change', callback)
    return () => controls?.removeEventListener?.('change', callback)
  }, [controls, regress, performance, invalidate])

  return <primitive ref={ref} dispose={undefined} object={controls} {...rest} />
})
