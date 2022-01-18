import React from 'react';
import {PtsCanvas} from 'react-pts-canvas';
import {Pt, Group, Line, Create, Sound, Triangle, Const, Geom, Color, Rectangle} from 'pts/dist/es5';

export default class Grid extends PtsCanvas{
  mousedown = false;
  mouseup = false;
  colorMappings = ['white', "black", "blue", "red", "green", "purple", "yellow"];
  constructor() {
    super();
  }

  colorOfKey(key){
    return this.colorMappings[key]
  }

  canvasClicked = (function(event){
    let elem = this.space.element,
    elemLeft = elem.offsetLeft + elem.clientLeft,
    elemTop = elem.offsetTop + elem.clientTop,
    context = elem.getContext('2d');
    let x = event.pageX - elemLeft,
        y = event.pageY - elemTop;
    let bar = Math.floor(x*50/this.space.width);
    let foo = Math.floor(y*50/this.space.width);
    let currentIndex = 50 * foo + bar;
    let current = this.props.gridState[currentIndex];
    this.props.changeGrid(currentIndex,(current + 1)%2);
    this.mousedown = true;
  }).bind(this);

  componentDidUpdate() {
    if (this.props.pause) {
      this.space.pause();
    } else {
      this.space.resume();
    }
  }

  // Override PtsCanvas' start function
  start(space, bound) {
    this.gd = Create.gridPts( this.space.innerBound, 50, 50 );
    this.width = this.space.width;
    this.space.element.addEventListener("mousedown", this.canvasClicked, false);
  }

  // Override PtsCanvas' resize function
  resize() {
    this.gd = Create.gridPts( this.space.innerBound, 50, 50 );
    this.width = this.space.width;
  }

  coordChange(point){
    return [this.width*point[0]/50, this.width*point[1]/50];
  }
  // Override PtsCanvas' animate function
  animate(time, ftime) {
    // Use pointer position to change speed
    let size = this.width/105;
    for (const[key, value] of this.gd.entries()){
      this.form.fillOnly(this.colorOfKey(this.props.gridState[key])).point(value, size, "square" );
    }
    for (const [index, animation] of this.props.gridAnimations.entries()){
      if (animation.progress >= animation.duration){this.props.deleteAnimation(index)}
      if (animation.type == "dot"){
        let progress = Math.min(animation.progress/animation.duration,1)
        this.form.fillOnly(animation.color).point(this.gd[animation.index], size-size*progress, "circle" );
      } else if (animation.type == "x"){
        let coordinates = this.coordChange(animation.position);
        let rect = Rectangle.corners( Rectangle.fromCenter( coordinates, size*3 ) ).rotate2D( 1.4, this.coordChange(animation.position) );
        this.form.strokeOnly(this.colorMappings[animation.color], size*(1.2-100/animation.progress)*3/2).lines( [ [rect[0], rect[2]], [rect[1], rect[3]] ] );
        this.form.strokeOnly("white", size/4).lines( [ [rect[0], rect[2]], [rect[1], rect[3]] ] );
      }else if (animation.type == "mean"){
        let progressTransform = animation.progress/30;
        let newPositions = animation.pointPositions.map((element) => this.coordChange([(element[0]+progressTransform*animation.position[0])/(progressTransform+1), (element[1]+progressTransform*animation.position[1])/(progressTransform+1)]))
        for (let element of newPositions){
          this.form.fillOnly(this.colorMappings[animation.color]).point(element, size/(progressTransform/5+1), "circle" );
        }
      }
      animation.progress += ftime;
    }
  }

  action(type, x, y){
  }
}
