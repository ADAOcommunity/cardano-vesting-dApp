import {useCallback } from 'react'
import type { Container, Engine } from "tsparticles-engine";
import Particles  from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {

  const options: any = {
    background: {
      color: {
        value: "#020713",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "attract",
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 2,
        },
        repulse: {
          distance: 100,
          duration: 0.5,
        },
        attract: {
          distance: 200,
          duration: 0.5,
          factor:2
        },
      },
    },
    particles: {
      color: {
        value: "#3264a8",
      },
      links: {
       // color: "#D99330",
       color: "#2f2e3d",
        distance: 210,
        enable: true,
        opacity: 1,
        width: 0.5,
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 600,
        },
        value: 60,
      },
      opacity: {
        value: 0.4,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 4 },
      },
    },
    detectRetina: true,
  }
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log(engine);

    // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    await console.log(container);
  }, []);
  return (
    <>
      <Particles style={{zIndex:-100, position:'absolute', top:0, left:0, width:'100%', height:'100%'}} options={options} init={particlesInit} loaded={particlesLoaded} />
    </>
  )
}

export default ParticlesBackground