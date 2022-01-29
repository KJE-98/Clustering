import React from 'react';
import {PtsCanvas} from 'react-pts-canvas';
import {Pt, Group, Line, Create, Sound, Triangle, Const, Geom, Color, Rectangle} from 'pts/dist/es5';

export default class Grid extends PtsCanvas{
  mousedown = false;
  mouseup = false;
  constructor() {
    super();
    this.colorMappings = ["white", "black", "#3287d1", "#08c6f8", "#7c69ee", "#fba3f4", "#8df8e4", "#059691", "#75f679", "#f48571", "#d04a5f"];
    for (let i = 0; i<420; i++){
      //this.colorMappings = ['white', "black", "blue", "red", "green", "purple", "yellow"];
      this.colorMappings.push("#" + Math.floor(14550000 + (i*97777)%2227215).toString(16));
    }
  }

  colorOfKey(key){
    return this.colorMappings[key]
  }

  calculateSliderValue(value){
    return Math.floor((16/81 * ((3/2)**value))*10)/10;
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
    let jumpStart = 0;
    let size = this.width/105;
    for (const[key, value] of this.gd.entries()){
      this.form.fillOnly(this.colorOfKey(this.props.gridState[key])).point(value, size, "square" );
    }
    if (this.props.isPaused == 0){
    }
    let animationsToDelete = [];
    let adjuster = 0;
    for (const [index, animation] of this.props.gridAnimations.entries()){
      if (animation.delay>0){animation.delay -= ((ftime)*this.calculateSliderValue(this.props.sliderValue) + jumpStart); continue;}
      if (animation.progress >= animation.duration && animation.type != "break"){animationsToDelete.push(index - adjuster); adjuster++; continue;}
      if (animation.type == "dot"){
        let progress = Math.min(animation.progress/animation.duration,1)
        this.form.fillOnly(animation.color).point(this.gd[animation.index], size-size*progress, "circle" );
      } else if (animation.type == "x"){
        let coordinates = this.coordChange(animation.position);
        let rect = Rectangle.corners( Rectangle.fromCenter( coordinates, size*3 ) ).rotate2D( 1.5, this.coordChange(animation.position) );
        this.form.strokeOnly(this.colorMappings[animation.color], size*(1.2-50/animation.progress)*3/2).lines( [ [rect[0], rect[2]], [rect[1], rect[3]] ] );
        this.form.strokeOnly("white", size/4).lines( [ [rect[0], rect[2]], [rect[1], rect[3]] ] );
      }else if (animation.type == "mean"){
        let progressTransform = animation.progress/200;
        let newPositions = animation.pointPositions.map((element) => this.coordChange([(element[0]-animation.position[0])/((progressTransform**3)/2+1)+animation.position[0], (element[1]-animation.position[1])/((progressTransform**3)/2+1)+animation.position[1]]))
        for (let element of newPositions){
          this.form.fillOnly(this.colorMappings[animation.color]).point(element, size/(progressTransform/5+1), "circle" );
        }
      }else if (animation.type == "circle"){
        let progressTransform = Math.min(animation.progress/100, 6.3);
        let positionTransform = this.coordChange(animation.position);
        this.form.strokeOnly(this.colorMappings[animation.color],3).arc(positionTransform, animation.radius*this.width/50, 0, progressTransform);
      }else if (animation.type == "break"){
        if (animation.progress>animation.duration){
          jumpStart = animation.progress-animation.duration;
          animationsToDelete.push(index - adjuster);
          adjuster++;
          continue;
        }
        animation.progress += (ftime)*this.calculateSliderValue(this.props.sliderValue);
        break;
      }else if (animation.type == "point"){
        let fromColor = this.colorMappings[this.props.gridState[animation.index]];
        this.props.changeGrid(animation.index, animation.color);
        this.props.gridAnimations[index] = {
          progress: 0,
          duration: 350,
          type: "dot",
          index: animation.index,
          color: fromColor,
          delay: 0
        }
        continue;
      }
      animation.progress += ((ftime)*this.calculateSliderValue(this.props.sliderValue)-animation.delay + jumpStart);
      animation.delay = 0;
    }
    for ( let [index,element] of animationsToDelete.entries()){
      this.deleteAnimation(element);
    }
  }

  action(type, x, y){
  }

  deleteAnimation = (function(index){
    this.props.gridAnimations.splice(index,1);
  })
}
