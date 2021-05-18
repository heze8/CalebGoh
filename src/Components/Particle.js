import React from "react";
import Proton from "proton-engine";
import RAFManager from "raf-manager";
import Canvas from "./Canvas";

export default class Particles extends React.Component {
  constructor(props) {
    super(props);
    this._mousedown = true;

    this.mouseInfo = {
      x: 1003 / 2,
      y: 610 / 2
    };
    this.renderProton = this.renderProton.bind(this);
  }

  handleCanvasInited(canvas) {
    this.createProton(canvas);
    RAFManager.add(this.renderProton);
  }

  componentWillUnmount() {
    try {
      RAFManager.remove(this.renderProton);
      this.proton.destroy();
    } catch (e) {}
  }

  createProton(canvas) {
    const proton = new Proton();
    const emitter = new Proton.Emitter();
    emitter.damping = 0.008;

    emitter.rate = new Proton.Rate(300);
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(4));
    emitter.addInitialize(
      new Proton.Velocity(
        new Proton.Span(1.5),
        new Proton.Span(0, 360),
        "polar"
      )
    );

    this.repulsionBehaviour = new Proton.Repulsion(this.mouseInfo, 0, 0);
    this.crossZoneBehaviour = new Proton.CrossZone(
      new Proton.RectZone(0, 0, canvas.width, canvas.height),
      "cross"
    );
    emitter.addBehaviour(new Proton.Color("random"));
    emitter.addBehaviour(this.repulsionBehaviour);
    emitter.addBehaviour(this.crossZoneBehaviour);
    this.addRepulsionBehaviours(emitter, canvas);

    emitter.p.x = canvas.width / 2;
    emitter.p.y = canvas.height / 2;
    emitter.emit("once");
    proton.addEmitter(emitter);

    const renderer = this.createRenderer(canvas);
    proton.addRenderer(renderer);

    this.proton = proton;
    this.renderer = renderer;
  }

  addRepulsionBehaviours(emitter, canvas) {
    const total = 12;
    const d = 360 / total;
    const R = 230;

    for (let i = 0; i < 360; i += d) {
      const x = R * Math.cos((i * Math.PI) / 180);
      const y = R * Math.sin((i * Math.PI) / 180);
      emitter.addBehaviour(
        new Proton.Attraction(
          {
            x: x + canvas.width / 2,
            y: y + canvas.height / 2
          },
          10,
          300
        )
      );
    }

    emitter.addBehaviour(
      new Proton.Repulsion(
        {
          x: canvas.width / 2,
          y: canvas.height / 2
        },
        20,
        300
      )
    );
  }

  createRenderer(canvas) {
    const context = canvas.getContext("2d");
    const renderer = new Proton.CanvasRenderer(canvas);

    renderer.onProtonUpdate = () => {
      context.fillStyle = "rgba(0, 0, 0, 0.12)";
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    renderer.onParticleUpdate = particle => {
      context.beginPath();
      context.strokeStyle = particle.color;
      context.lineWidth = 1;
      context.moveTo(particle.old.p.x, particle.old.p.y);
      context.lineTo(particle.p.x, particle.p.y);
      context.closePath();
      context.stroke();
    };

    return renderer;
  }

  handleResize(width, height) {
    this.crossZoneBehaviour.reset(
      new Proton.RectZone(0, 0, width, height),
      "cross"
    );
    this.crossZoneBehaviour.zone.width = width;
    this.crossZoneBehaviour.zone.height = height;
    this.proton.renderers[0].resize(width, height);
  }


  handleMouseMove(e) {
    if (this._mousedown) {
      var _x, _y;
      if (e.pageX || e.pageX === 0) {
        _x = e.pageX;
        _y = e.pageY;
      } else if (e.offsetX || e.offsetX === 0) {
        _x = e.offsetX;
        _y = e.offsetY;
      }
      console.log(" " + _x + _y);
      this.mouseInfo.x = _x;
      this.mouseInfo.y = _y;
      this.repulsionBehaviour.reset(this.mouseInfo, 30, 500);
    }
  }


  renderProton() {
    this.proton && this.proton.update();
  }

  render() {
    return (
        <Canvas
        bg = {true}
        globalCompositeOperation="darken"
        onMouseMove={this.handleMouseMove.bind(this)}
        onCanvasInited={this.handleCanvasInited.bind(this)}
        onResize={this.handleResize.bind(this)}
      />
    );
  }
}
