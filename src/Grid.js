import React from 'react';
import {PtsCanvas} from 'react-pts-canvas';
import {Pt, Group, Line, Create, Sound, Triangle, Const, Geom} from 'pts/dist/es5';

export default class Grid extends PtsCanvas{

  constructor() {
    super();
    this.colorGrid = new Array(10000).fill(0);
    this.colorMappings = ['#e0fffe']
  }

  _create() {
    // Create a line and a grid, and convert them to `Noise` points
    this.gd = Create.gridPts( this.space.innerBound, 50, 50 );
  }

  colorOfKey(key){
    return this.colorMappings[key]
  }

  componentDidUpdate() {
    if (this.props.pause) {
      this.space.pause();
    } else {
      this.space.resume();
    }
  }


  // Override PtsCanvas' start function
  start(space, bound) {
    this._create();
  }


  // Override PtsCanvas' resize function
  resize() {
    this._create();
  }

  // Override PtsCanvas' animate function
  animate(time, ftime) {
    // Use pointer position to change speed
    let speed = this.space.pointer.$subtract( this.space.center ).divide( this.space.center ).abs();
    // Generate noise in a grid
    for (const[key, value] of this.gd.entries()){
      this.form.fillOnly(this.colorOfKey(this.colorGrid[key])).point(value, 5, "square" );
    }
  }

  action(type, x, y){

  }

}
