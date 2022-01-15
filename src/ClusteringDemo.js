import React from 'react';
import logo from './logo.svg';
import {
  Paper,
  AppBar,
  Stack,
  Item,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Pagination,
  Box,
  Zoom,
  Slide,
  Container,
  ButtonGroup,
  Button
} from '@mui/material';
import Grid from './Grid.js';

export default class ClusteringDemo extends React.Component {
  gridState = new Array(10000).fill(0);
  gridAnimations = [];
  colorMappings = ['white', "black", "blue", "red", "green", "purple", "yellow"];

  copy(grid){
    let result = [];
    for (let element of grid){
      result.push(element);
    }
    return result;
  }

  indexToxy(index){
    let y = Math.floor(index/50) + .5;
    let x = index%50 + .5;
    return([x,y]);
  }

  interpretAnimation = (function(queue){
    if (queue.length == 0){return}
    let next = queue.shift();
    console.log(next);
    if (next.type == "point"){
      this.changeGrid(next.position, next.color)
      this.interpretAnimation(queue);
    }else if (next.type == "break"){
      setTimeout(this.interpretAnimation, next.duration, queue);
    }else if (next.type == "x"){
      console.log("hello");
      this.addAnimation("x", next.position, next.color);
      this.interpretAnimation(queue);
    }
  }).bind(this);

  k_means(k){
    let animationQueue = []
    let grid = this.copy(this.gridState);
    //create n random points to be the initial centers
    let centerArray = new Array(k).fill(0).map(() => [Math.random()*50,Math.random()*50])
    let goAgain = true;
    // loop
    while (goAgain == true){
      goAgain = false;
      let centerColor = 2;
      for (let point of centerArray){
        console.log(point);
        animationQueue.push({
          type: "x",
          position: point,
          color:  centerColor
        });
        centerColor++;
      }
      animationQueue.push({
        type: "break",
        duration: 1000,
      });
      let newCenterArray = new Array(k).fill(0).map(() => [0,0]);
      let newCenterArrayHelper = new Array(k).fill(0);
      let newGrid = this.copy(grid);
      for(const [index,point] of grid.entries()){
        if (point == 0) {continue;}

        let coordinates = (this.indexToxy(index));
        let distance = 100000;
        let closest = 2;
        let clusterIndex = 2;

        for (let center of centerArray){
          let newDistance = (center[0]-coordinates[0])**2 + (center[1]-coordinates[1])**2;
          if (newDistance<distance){
            closest = clusterIndex;
            distance = newDistance;
          }
          clusterIndex++;
        }
        newGrid[index] = closest;
        if (closest != point){
          goAgain = true;
          animationQueue.push({
            type: "point",
            color: closest,
            position: index,
          });
        }
        newCenterArray[closest-2][0] += coordinates[0];
        newCenterArray[closest-2][1] += coordinates[1];
        newCenterArrayHelper[closest-2] += 1;
      }
      centerArray = newCenterArray.map((element, index) => {
        if (newCenterArrayHelper[index]==0){return [Math.random()*50,Math.random()*50]}
        return [element[0]/newCenterArrayHelper[index],element[1]/newCenterArrayHelper[index]]
      });
      grid = newGrid;
      animationQueue.push({
        type: "break",
        duration: 1000,
      });
    }
    this.interpretAnimation(animationQueue);
    return animationQueue;
  }

  mean_shift(r){
    
  }

  hoistSpace = (space)=> {
    this.gridSpace = space;
  }

  changeAlg = (function(event) {
    this.setState({algType: event.target.value});
    this.addAnimation("dot", 150);
    this.createRandomPoints(300);
  }).bind(this);

  changeGrid = (function(index, key) {
    this.addAnimation("dot", index);
    this.gridState[index] = key;
  }).bind(this);

  clearGrid = (function(indexStart) {
    if (indexStart>9999) {
      return
    }
    for (let i = indexStart; i<indexStart+100; i++){
      if (this.gridState[i] != 0){
        this.addAnimation("dot", i);
        this.gridState[i] = 0;
      }
    }
    setTimeout(this.clearGrid,10,indexStart+100);
  }).bind(this);

  addAnimation = function(type, position, color){
    let animationObj = {}
    if (type == "dot"){
      animationObj = {
        progress: 0,
        duration: 350,
        type: "dot",
        index: position,
        color: this.colorMappings[this.gridState[position]]
      }
    }else if (type == "x"){
      console.log("addAnimation");
      animationObj = {
        progress: 0,
        duration: 1000,
        type: 'x',
        position: position,
        color: color,
      }
    }
    this.gridAnimations.push(animationObj)
  }

  deleteAnimation = (function(index){
    this.gridAnimations.splice(index,1);
  }).bind(this);

  createRandomPoints(n){
    for (let i = 0; i<2500; i++){
      this.changeGrid(i, 0);
    }
    for (let i = 0; i<n; i++){
      let x = Math.floor(Math.random()*50);
      let y = Math.floor(Math.random()*50);
      this.changeGrid(50*y+x, 1);
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      algType: 0,
      n: 1,
    };
  }

  manageOptions() {
    return (<Box type="span">
      <Box style={{
          position: "absolute"
        }}>
        <Stack direction="row" spacing={3}>
        <Box>
        <Slide in={this.state.algType === 0} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <InputLabel id="pagination-label" shrink={true}>Number of Clusters</InputLabel>
        </Slide>
        <Slide in={this.state.algType === 0} onChange={(e,p)=>{this.setState({n: p})}} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <Pagination count={10} color="primary"/>
        </Slide>
        </Box>
        <Slide in={this.state.algType === 0} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button onClick={()=>{this.k_means(this.state.n)}}>Run Algorithm</Button>
            <Button onClick={()=>{this.clearGrid(0)}}>Clear Points</Button>
          </ButtonGroup>
        </Slide>
        </Stack>
      </Box>

      <Box style={{
          position: "absolute"
        }}>
        <Stack direction="row" spacing={3}>
        <Slide in={this.state.algType === 2} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <TextField id="mean-shift-radius" label="Radius" variant="standard"/>
        </Slide>
        <Slide in={this.state.algType === 2} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button>Run Algorithm</Button>
            <Button onClick={()=>{this.clearGrid(0)}}>Clear Points</Button>
          </ButtonGroup>
        </Slide>
        </Stack>
      </Box>

      <Box style={{
          position: "absolute"
        }}>
        <Stack direction="row" spacing={3}>
          <Slide in={this.state.algType === 3} timeout={500} direction="down" mountOnEnter unmountOnExit>
            <TextField id="DBSCAN-radius" label="Radius" variant="standard"/>
          </Slide>
          <Slide id="alg3" in={this.state.algType === 3} timeout={500} direction="down" mountOnEnter unmountOnExit>
            <TextField id="DBSCAN-ppc" label="Points per cluster" variant="standard"/>
          </Slide>
          <Slide in={this.state.algType === 3} timeout={500} direction="down" mountOnEnter unmountOnExit>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
              <Button>Run Algorithm</Button>
              <Button onClick={()=>{this.clearGrid(0)}}>Clear Points</Button>
            </ButtonGroup>
          </Slide>
        </Stack>
      </Box>
    </Box>)
  }

  render() {
    return (<> < AppBar position = "static" style = {{
      padding: 10
    }} > <Stack direction="row" spacing={2}>
      <img src={logo} className="App-logo" alt="logo" size="small" style={{
          height: 60
        }}/>
      <FormControl sx={{
          minWidth: 200
        }}>
        <InputLabel id="select-algorithm-label">Algorithm</InputLabel>
        <Select labelId="select-algorithm-label" id="demo-simple-select" label="Algorithm" value={this.state.algType} onChange={this.changeAlg}>
          <MenuItem value={0}>K-means</MenuItem>
          <MenuItem value={1}>Specral</MenuItem>
          <MenuItem value={2}>Mean-Shift</MenuItem>
          <MenuItem value={3}>DBSCAN</MenuItem>
          <MenuItem value={4}>GMM</MenuItem>
          <MenuItem value={5}>Agglomerative</MenuItem>
          <MenuItem value={6}>BIRCH</MenuItem>
        </Select>
      </FormControl>
      {this.manageOptions()}
    </Stack> < /AppBar>
    <Box sx={{backgroundColor: "#dcfcfc", paddingTop: "1vw"}}>
      <Paper elevation={6} sx={{display: "inline-block", width: "23vw", height: "45vw", backgroundColor: "#e3fdff", margin: "1vw"}}>
      </Paper>
      <Paper elevation={6} sx={{display: "inline-block", width: "45vw", height: "45vw", backgroundColor: "#e3fdff", margin: "1vw"}}>
        <Grid style={{width: "45vw", height: "45vw", borderRadius: "1px"}} background="#e3fdff" gridState={this.gridState}
                    changeGrid={this.changeGrid} gridAnimations={this.gridAnimations} deleteAnimation={this.deleteAnimation}>
        </Grid>
      </Paper>
      <Paper elevation={6} sx={{display: "inline-block", width: "23vw", height: "45vw", backgroundColor: "#e3fdff", margin: "1vw"}}>
      </Paper>
    </Box>
    </>);
  }
}
