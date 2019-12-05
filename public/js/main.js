/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

window.onload = () => {
  const scene = new Scene();
  this.scene = scene;

  // Set Google Assistant Canvas Action at scene level
  this.action = new Action(scene);
  // Call setCallbacks to register interactive canvas
  this.action.setCallbacks();
}

/**
 * Represent Triangle scene
 */
class Scene {
  constructor() {
    const view = document.getElementById('view');

    // set up fps monitoring
    const stats = new Stats();
    view.getElementsByClassName('stats')[0].appendChild(stats.domElement);

    // initialize rendering and set correct sizing
    const ratio = window.devicePixelRatio;
    this.renderer = PIXI.autoDetectRenderer({
      transparent: true,
      antialias: true,
      resolution: ratio,

      width: view.clientWidth,
      height: view.clientHeight,
    });


    const element = this.renderer.view;
    element.style.width = `${this.renderer.width / ratio}px`;
    element.style.height = `${this.renderer.height / ratio}px`;
    view.appendChild(element);

    // center stage and normalize scaling for all resolutions
    this.stage = new PIXI.Container();
    this.stage.interactive = true;

    this.imageStage = new PIXI.Container();
    this.uistage = new PIXI.UI.Stage(window.clientWidth, window.clientHeight);
    this.uistage.interactive = true;


    this.uistage.position.set(view.clientWidth / 2, view.clientHeight / 2);
    this.imageStage.position.set(view.clientWidth / 2, view.clientHeight / 2);

    this.uistage.scale.set(Math.max(this.renderer.width, this.renderer.height) / 1280);
    this.imageStage.scale.set(Math.max(this.renderer.width, this.renderer.height) / 1280);

    this.stage.addChild(this.imageStage);
    this.stage.addChild(this.uistage);


    // load a sprite from a svg file
    // this.updateImage('./triangle.svg', 0x00FF00);
    // this.stage.addChild(uistage);

    // toggle spin on touch events of the triangle
    /*sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.on('pointerdown', () => {
      sprite.spin = !sprite.spin;
    });*/

    let last = performance.now();
    // frame-by-frame animation function
    const frame = () => {
      stats.begin();

      // calculate time differences for smooth animations
      const now = performance.now();
      const delta = now - last;

      // rotate the triangle only if spin is true
      /*if (sprite.spin) {
        sprite.rotation += delta / 1000;
      }*/

      last = now;
      this.renderer.render(this.stage);
      stats.end();
      requestAnimationFrame(frame);
    };
    frame();

    this.renderer.render(this.stage);

  }

  render=()=>{
    console.log('render', this.stage, this.renderer);
    this.renderer.render(this.stage);
  };

  setButtons=(buttons, canvasActions)=>{
    this.uistage.children.forEach(child=>{
      child.destroy();
    });

    let padding = 16, leftOffset = 0, leftOffsetToCenter = (buttons.length - 1) * padding + (buttons.reduce( (acc, currentValue) => acc + (currentValue.title.length * 15  + padding * 2), 0));

    buttons.forEach( (button,key) => {
      let width = button.title.length * 15 + padding * 2;

      let canvasButton = new PIXI.UI.Button({
        background: new PIXI.UI.Sprite(PIXI.Texture.WHITE),
        text: new PIXI.UI.Text(button.title, new PIXI.TextStyle({fill: 'black'})),
        width: width,
        height: 50
      });

      canvasButton.background.alpha = 0.5;
      canvasButton.x = -(leftOffsetToCenter/2) + (key > 0 ? leftOffset : 0 );
      canvasButton.y = 0;

      leftOffset += width + padding;

      canvasButton.on("hover", function (over) {
        console.log('!!! BUTTON HOVER', canvasButton.text.text);
        const ease = over ? PIXI.UI.Ease.Bounce.BounceOut : PIXI.UI.Ease.Circ.CircOut;
        PIXI.UI.Tween.to(canvasButton.background, 0.5, { scale: over ? 1.15 : 1, tint: over ? "#000000" : "#000000" }, ease);
      });
      canvasButton.on("click", function (over) {
        console.log('!!! BUTTON click', canvasButton.text.text);
      });
      this.uistage.addChild(canvasButton);

    });
    this.render();

  };

  updateImage=(imageUrl, color)=>{
    console.log('imageUrl', imageUrl);
    this.imageStage.children.forEach(child=>{
      child.destroy();
    });
    const sprite = PIXI.Sprite.from(imageUrl);
    if(color){
      sprite.tint = color;
    }
    sprite.anchor.set(0.5);
    this.imageStage.addChild(sprite);

    this.render();

  }
}