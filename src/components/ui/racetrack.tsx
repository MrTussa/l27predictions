'use client'

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
// @ts-ignore
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
// @ts-ignore
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// @ts-ignore
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
// @ts-ignore
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

extend({ EffectComposer, RenderPass, UnrealBloomPass })

interface GlowingTrackProps {
  svgPath: string
  color?: string
  rotationSpeed?: number
}

interface RaceTrackVisualizationProps {
  svgPath?: string
  color?: string
  backgroundColor?: string
  cameraAngle?: number
  rotationSpeed?: number
  /**
   * При использовании отключает transparent
   */
  useBloom?: boolean
  className?: string
  bloomStrength?: number
}

interface EffectsProps {
  bloomStrength: number
}

function GlowingTrack({ svgPath, color = '#00ff00', rotationSpeed = 0.001 }: GlowingTrackProps) {
  const groupRef = useRef<THREE.Group>(null)

  const points = useMemo(() => {
    const loader = new SVGLoader()
    const data = loader.parse(svgPath)

    const paths = data.paths
    const allPoints: THREE.Vector3[] = []

    paths.forEach((path: THREE.ShapePath) => {
      const shapes = SVGLoader.createShapes(path)
      shapes.forEach((shape: THREE.Shape) => {
        const shapePoints = shape.getPoints(150)
        const points3D = shapePoints.map((point) => {
          const x = (point.x - 400) / 80
          const y = -(point.y - 400) / 80
          return new THREE.Vector3(x, y, 0)
        })
        allPoints.push(...points3D)
      })
    })

    if (allPoints.length > 0) {
      allPoints.push(allPoints[0])
    }

    return allPoints
  }, [svgPath])

  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
        time: { value: 0 },
        glowIntensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        uniform float glowIntensity;
        varying vec2 vUv;

        void main() {
          float glow = sin(time * 2.0) * 0.5 + 0.5;
          vec3 finalColor = color * (1.0 + glow * 0.3) * glowIntensity;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    })
  }, [color])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += rotationSpeed
    }
    if (glowMaterial && glowMaterial.uniforms) {
      glowMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  if (points.length === 0) return null

  const curve = new THREE.CatmullRomCurve3(points, false)
  const tubeGeometry = new THREE.TubeGeometry(curve, 300, 0.05, 8, false)

  return (
    <group ref={groupRef} position={[0, 1.74, -1.01]}>
      <mesh geometry={tubeGeometry} material={glowMaterial} />
    </group>
  )
}

function Effects({ bloomStrength }: EffectsProps) {
  const { gl, camera, scene, size } = useThree()
  const composer = useRef<EffectComposer | null>(null)

  useEffect(() => {
    gl.setClearColor(0x000000, 0)

    const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    })

    const effectComposer = new EffectComposer(gl, renderTarget)

    const renderPass = new RenderPass(scene, camera)
    renderPass.clearAlpha = 0
    effectComposer.addPass(renderPass)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomStrength, // strength
      0.4, // radius
      0.25, // threshold
    )
    effectComposer.addPass(bloomPass)

    composer.current = effectComposer

    return () => {
      effectComposer.dispose()
      renderTarget.dispose()
    }
  }, [gl, camera, scene, size])

  useFrame(() => {
    if (composer.current) {
      composer.current.render()
    }
  }, 1)

  return null
}

export default function RaceTrackVisualization({
  svgPath = '<svg fill="#000000" version="1.1"  xmlns="http://www.w3.org/2000/svg"><path d="m610.18 413.43-262.68-223.55c-4.6719-3.9766-11.523-4.9375-17.113-2.3711l-2.0625 0.94531c-1.1094 0.50781-2.2852 0.80859-3.5039 0.90625l-125.5 9.6719c-8.0078 0.61719-14.023 7.6367-13.406 15.645l4.6836 60.766c0.72656 9.4453 5.5469 18.047 13.223 23.598l14.254 10.316c1.668 1.2109 2.7188 3.082 2.875 5.1328l5.0312 65.324c0.38672 5.0938 4.6914 9.082 9.7969 9.082l55.34-4.582 4.0039 52.004c0.39844 5.0859 4.6992 9.0703 9.7969 9.0703l99.68-7.6523c7.9531-0.64062 15.918 1.3672 22.656 5.6289l20.383 12.887c3.9453 2.4961 8.5742 3.6562 13.277 3.3008l2.9648-0.21875c1.2305 0 2.3789 0.55859 3.1406 1.5273l64.227 81.625-3.9258 3.0859-26.984-34.336-7.2031-9.168 1.9805 16.242 4.918 0.76953 26.438 33.641 7.9297-6.2305 48.891 62.137c2.6562 3.3789 6.5898 5.3125 10.777 5.3125 4.043 0 7.8945-1.7305 10.57-4.7461 2.6133-2.9453 3.7812-6.7812 3.293-10.801l-5.4219-44.574c-0.94922-7.7852-4.1836-14.883-9.3594-20.52-8.1055-8.8281-17.836-16.742-28.93-23.52-10.668-6.5156-19.332-16-25.059-27.422l-13.184-26.309c-1.5273-3.043-0.75391-6.6836 1.875-8.8516l11.965-9.8789c5.8086-4.7969 13.289-7.25 20.832-6.7891l41.621 2.5195 0.71484 0.023437c4.6953 0 8.7852-2.8672 10.418-7.3047 1.6406-4.4375 0.36719-9.2734-3.2266-12.332zm-6.3125 8.8047c-0.16016 0.42578-0.39063 0.51953-0.96484 0.63672l-41.621-2.5195c-10.18-0.62109-20.145 2.668-27.93 9.0938l-11.965 9.8789c-6.3047 5.2031-8.1523 13.945-4.4922 21.258l13.184 26.309c6.5781 13.129 16.551 24.035 28.848 31.547 10.281 6.2773 19.273 13.586 26.742 21.715 3.7266 4.0625 6.0625 9.2031 6.7461 14.863l5.4219 44.574c0.14062 1.1172-0.13281 2.0703-0.80469 2.8281-1.4375 1.6289-4.2344 1.793-5.7305-0.10938l-116.26-147.75c-2.7031-3.4375-6.7617-5.4102-11.141-5.4102-0.36328 0-0.72656 0.015625-1.0938 0.042969l-2.6523 0.20703c-2.5039 0.1875-4.9648-0.42969-7.0586-1.7539l-20.383-12.891c-8.5859-5.4297-18.668-7.9688-28.879-7.1758l-98.547 7.9414-4.0039-52.004c-0.39844-5.0898-4.6992-9.0742-9.7969-9.0742l-55.34 4.5859-5.0312-65.332c-0.38672-5.0391-2.9609-9.6289-7.0586-12.594l-14.254-10.316c-5.2461-3.7969-8.543-9.6758-9.0391-16.133l-4.6836-60.766c-0.18359-2.418 1.6289-4.5352 4.043-4.7188l125.5-9.6719c2.4102-0.1875 4.75-0.78906 6.957-1.8008l2.0625-0.94531c2.0586-0.9375 4.5664-0.58984 6.2773 0.87109l262.66 223.56c0.15625 0.12891 0.51172 0.43359 0.28516 1.0547z"/></svg>',
  color = '#ffff00',
  backgroundColor = 'transparent',
  rotationSpeed = 0.002,
  useBloom = true,
  bloomStrength = 1,
  className,
}: RaceTrackVisualizationProps) {
  return (
    <div className={className} style={{ backgroundColor }}>
      <Canvas
        camera={{
          position: [0, -6, 6],
          fov: 35,
          near: 0.1,
          far: 40,
        }}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: 'low-power',
          preserveDrawingBuffer: true,
        }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <GlowingTrack svgPath={svgPath} color={color} rotationSpeed={rotationSpeed} />
        {useBloom && <Effects bloomStrength={bloomStrength} />}
      </Canvas>
    </div>
  )
}

export { GlowingTrack }
