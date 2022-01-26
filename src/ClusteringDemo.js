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
  Button,
  Slider,
  Typography
} from '@mui/material';
import Grid from './Grid.js';

export default class ClusteringDemo extends React.Component {
  gridState = new Array(10000).fill(0);
  gridAnimations = [];

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
    if (next.type == "point"){
      this.addAnimation('point', next.position, next.color)
      this.interpretAnimation(queue);
    }else if (next.type == "break"){
      this.addAnimation('break', null, null, null, 0, next.duration);
      this.interpretAnimation(queue);
    }else if (next.type == "x"){
      this.addAnimation("x", next.position, next.color, null, next.delay, next.duration);
      this.interpretAnimation(queue);
    }else if (next.type == "meanX"){
      let position = next.points.map((element) => this.indexToxy(element));
      this.addAnimation("mean", next.position, next.color, position);
      this.addAnimation("x", next.position, next.color, null, 1000, 1000);
      this.interpretAnimation(queue);
    }else if (next.type == "join"){
      this.interpretAnimation(queue);
    }else if (next.type == "circle"){
      this.addAnimation("circle", next.position, next.color, null, 0, next.duration);
      this.interpretAnimation(queue);
    }
  }).bind(this);

  k_means(k){

    let animationQueue = []
    let grid = this.copy(this.gridState);

    //create n random points to be the initial centers
    let centerArray = new Array(k).fill(0).map(() => [Math.random()*50,Math.random()*50])
    let goAgain = true;
    let atLeastOnePoint = true;
    let centerColor = 2;
    for (let point of centerArray){
      animationQueue.push({
        type: "x",
        position: point,
        color:  centerColor,
        delay: 0,
        duration: 1000
      });
      centerColor++;
    }
    animationQueue.push({
      type: "break",
      duration: 1000,
    });
    // loop
    while (goAgain&&atLeastOnePoint){
      console.log("runnign loop")
      goAgain = false;
      atLeastOnePoint = false;
      let newCenterArray = new Array(k).fill(0).map(() => [0,0]);
      let newCenterArrayHelper = new Array(k).fill(0);
      let centerArrayledger = new Array(k).fill(0).map(() => []);
      let newGrid = this.copy(grid);
      for(const [index,point] of grid.entries()){
        if (point == 0) {continue;}
        atLeastOnePoint = true;
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
        centerArrayledger[closest-2].push(index);

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
        if (newCenterArrayHelper[index]==0){goAgain = true; return [Math.random()*50,Math.random()*50]}
        return [element[0]/newCenterArrayHelper[index],element[1]/newCenterArrayHelper[index]]
      });
      grid = newGrid;
      animationQueue.push({
        type: "break",
        duration: 1000,
      });
      for (const [legerIndex, points] of centerArrayledger.entries()){
        animationQueue.push({
          type: "meanX",
          color: legerIndex+2,
          position: centerArray[legerIndex],
          points: points,
        });
      }
      animationQueue.push({
        type: "break",
        duration: 2000,
      });
    }
    console.log("interpretAnimation");
    this.interpretAnimation(animationQueue);
    return animationQueue;
  }

  mean_shift(r){
    let numberofcenters = 0;
    let number_rows = Math.floor(25/r)+1;
    let animationQueue = [];
    let grid = this.copy(this.gridState);
    //create points to be the initial centers
    let centerArray = new Array(number_rows**2).fill(0).map((element,index) => {
      let x = (Math.floor(index/number_rows)+.5) * (50/number_rows);
      let y = (index%number_rows+.5) * (50/number_rows);
      return [x,y];
    });
    let durationOfXAnimation = centerArray.length;
    for (let [index,center] of centerArray.entries()){
      animationQueue.push({
        type: "x",
        position: center,
        color:  2+index,
        delay: 0,
        duration: 1000
      });
      animationQueue.push({
        type: "circle",
        position: [center,r],
        color: 2 + index,
        duration: 2600 + 1600 * index
      });
    }
    for (let i = 0; i<10; i++){
      animationQueue.push({
        type: "break",
        duration: 1000,
      });
      let newCenter = new Array(centerArray.length).fill(0).map(() => [0,0]);
      let newCenterHelper = new Array(centerArray.length).fill(0).map(() => []);
      for (let [index, element] of grid.entries()){
        if (element == 0){continue;}
        let point = this.indexToxy(index);
        for (let [centerIndex, center] of centerArray.entries()){
          if (center == null){continue}
          let x_diff = Math.abs(point[0] - center[0]);
          let y_diff = Math.abs(point[1] - center[1]);
          if (x_diff > r || y_diff > r){continue;}
          if (x_diff**2+y_diff**2 < r**2){
            newCenter[centerIndex][0] += point[0];
            newCenter[centerIndex][1] += point[1];
            newCenterHelper[centerIndex].push(index);
          }
        }
      }
      centerArray = newCenter.map((element,index) => {
        let len = newCenterHelper[index].length;
        if (len == 0){return null;}
        let x = element[0]/len;
        let y = element[1]/len;
        return [x,y];
      });
      numberofcenters = 0;
      for (let [index,center] of centerArray.entries()){
        if (center != null){numberofcenters++;}
      }
      for (let [index,center] of centerArray.entries()){
        if (center == null){continue;}
        animationQueue.push({
          type: "break",
          duration: 800,
        });
        animationQueue.push({
          type: "meanX",
          position: center,
          color:  2 + index,
          points: this.copy(newCenterHelper[index]),
        });
        animationQueue.push({
          type: "break",
          duration: 800,
        });
        animationQueue.push({
          type: "circle",
          position: [center,r],
          color: 2 + index,
          duration: 1600 * numberofcenters + 500
        });
      }
    }
    this.interpretAnimation(animationQueue);
    return animationQueue;
  }

  agglomerative(){
    let clusters = new Array(100).fill(0);
    let animationQueue = [];
    let grid = this.copy(this.gridState);
    let goAgain = true;
    let ticker = 0
    while (goAgain){
      goAgain = false;
      ticker++;
      let nextJoining = [];
      let minDistance = 100000;
      for (let i = 0; i<2500; i++){
        let i_coord = this.indexToxy(i);
        if (grid[i] == 0){continue;}
        for (let j = i + 1; j<2500; j++){

          if (grid[j] == 0){continue;}
          if ((grid[i] == grid[j] && grid[i] != 1)){continue;}
          let j_coord = this.indexToxy(j);
          let distance = (i_coord[0]-j_coord[0])**2 + (i_coord[1]-j_coord[1])**2
          if (distance < minDistance){
            minDistance = distance;
            nextJoining = [i,j];
            goAgain = true;
          }
        }
      }
      if (grid[nextJoining[0]] == 1 && grid[nextJoining[1]] == 1){
        let color = -1;
        for (let [index, element] of clusters.entries()){
          if (element == 0){
            color = index;
            break;
          }
        }
        grid[nextJoining[0]] = color + 2;
        grid[nextJoining[1]] = color + 2;
        clusters[color] = 1;
        animationQueue.push({
          type: "join",
          position: nextJoining,
          color: color + 2,
        });
        animationQueue.push({
          type: "point",
          position: nextJoining[0],
          color: color + 2,
        });
        animationQueue.push({
          type: "point",
          position: nextJoining[1],
          color: color + 2,
        })
      } else if (grid[nextJoining[0]] == 1){
        let cluster = grid[nextJoining[1]];
        grid[nextJoining[0]] = cluster;
        grid[nextJoining[1]] = cluster;
        animationQueue.push({
          type: "join",
          position: nextJoining,
          color: cluster,
        });
        animationQueue.push({
          type: "point",
          position: nextJoining[0],
          color: cluster,
        });
      }else if (grid[nextJoining[1]] == 1){
        let cluster = grid[nextJoining[0]];
        grid[nextJoining[0]] = cluster;
        grid[nextJoining[1]] = cluster;
        animationQueue.push({
          type: "join",
          position: nextJoining,
          color: cluster,
        });
        animationQueue.push({
          type: "point",
          position: nextJoining[1],
          color: cluster,
        });
      }else{
        let moveFrom;
        let moveTo;
        if (grid[nextJoining[0]]<grid[nextJoining[1]]){
          moveFrom = grid[nextJoining[1]];
          moveTo = grid[nextJoining[0]];
        } else if (grid[nextJoining[0]]>grid[nextJoining[1]]){
          moveTo = grid[nextJoining[1]];
          moveFrom = grid[nextJoining[0]];
        } else {}
        animationQueue.push({
          type: "join",
          position: nextJoining,
          color: moveTo,
        });
        for (let [index, element] of grid.entries()){
          if (element == moveFrom){
            grid[index] = moveTo;
            animationQueue.push({
              type: "point",
              position: index,
              color: moveTo,
            });
          }
        }
      }
      animationQueue.push({
        type: "break",
        duration: 400,
      });
    }
    this.interpretAnimation(animationQueue);
  }

  DBSCAN(r, minCluster){

  }

  changeAlg = (function(event) {
    this.setState({algType: event.target.value});
    this.addAnimation("dot", 150);
    this.createRandomPoints();
  }).bind(this);

  changeGrid = (function(index, key) {
    this.addAnimation("dot", index);
    this.gridState[index] = key;
  }).bind(this);

  changeGridAnimate = (function(index, key) {
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

  addAnimation = (function(type, position, color, pointPositions, delay, duration){
    let animationObj = {};
    if (type == "point"){
      animationObj = {
        type: "point",
        index: position,
        color: color
      }
    } else if (type == "dot"){
      animationObj = {
        progress: 0,
        duration: 350,
        type: "dot",
        index: position,
        color: this.colorMappings[this.gridState[position]]
      }
    }else if (type == "x"){
      animationObj = {
        delay: delay,
        progress: 0,
        duration: duration,
        type: 'x',
        position: position,
        color: color,
      }
    }else if (type == "mean"){
      animationObj = {
        progress: 0,
        duration: 1000,
        type: 'mean',
        position: position,
        color: color,
        pointPositions: pointPositions
      }
    }else if (type == "circle"){
      animationObj = {
        progress: 0,
        duration: duration,
        type: 'circle',
        position: position[0],
        radius: position[1],
        color: color,
        delay: delay,
      }
    }else if (type == "break"){
      animationObj = {
        progress: 0,
        duration: duration,
        type: 'break',
        delay: delay,
      }
    }
    this.gridAnimations.push(animationObj)
  }).bind(this);

  deleteAnimation = (function(index){
    this.gridAnimations.splice(index,1);
  }).bind(this);

  createRandomPoints(){
    let center_1 = this.indexToxy(Math.floor(Math.random()*2500));
    let center_2 = this.indexToxy(Math.floor(Math.random()*2500));
    let center_3 = this.indexToxy(Math.floor(Math.random()*2500));
    for (let i = 0; i<2500; i++){
      let baseline = Math.random();
      this.changeGridAnimate(i, 0);
      if (baseline < .30){continue;}
      if (baseline > .95){this.changeGridAnimate(i, 1);continue;}
      let coords = this.indexToxy(i);
      let dist_1 = Math.sqrt((center_1[0]-coords[0])**2 + (center_1[1]-coords[1])**2);
      let dist_2 = Math.sqrt((center_2[0]-coords[0])**2 + (center_2[1]-coords[1])**2);
      let dist_3 = Math.sqrt((center_3[0]-coords[0])**2 + (center_3[1]-coords[1])**2);
      if (dist_1<Math.random()*7||dist_2<Math.random()*7||dist_3<Math.random()*7){
        this.changeGridAnimate(i, 1);
      }
    }
  }

  calculateSliderValue(value){
    return Math.floor((16/81 * ((3/2)**value))*10)/10;
  }

  handleSliderChange = (function(event, newValue) {
    if (typeof newValue === 'number') {
      this.setState({sliderValue: newValue});
    }
  }).bind(this)

  constructor(props) {
    super(props);
    //this.colorMappings = ['white', "black", "blue", "red", "green", "purple", "yellow"];
    this.algDescriptions = [
      <>
        <Container elevation={4} sx={{margin: "0vw", backgroundColor: "#85a5d4"}}>
          <h3 style={{margin: 0, marginBottom: "1vw"}}>K-Means</h3>
        </Container>
        <Container sx={{fontFamily: 'Ubuntu'}}>
          <p>K-means is a clustering algorithm that iteratively adjusts a set number of clusters until an acceptable end state is reached.</p>
          <p>The user must choose one parameter: the number of clusters. This number will be stored in the variable k. To start, k number of "center points" are chosen; in this implementation, these center points are chosen randomly.</p>
          <p>The iterative step has two parts. First, the each point calculates which center point it is closest to. The points are clustered according to which center is closest. Then, each cluster calculates its average possition, and the old center points are thrown out and replaced by the previously calculated averages.</p>
          <p>The iteration is repeated until the center points no longer change, and the clustering at that point is the final clustering.</p>
        </Container>
      </>,
      <>
        <Container elevation={4} sx={{margin: "0vw", backgroundColor: "#85a5d4"}}>
          <h3 style={{margin: 0, marginBottom: "1vw"}}>Agglomerative</h3>
        </Container>
        <Container sx={{fontFamily: 'Ubuntu'}}>
          <p> Agglomerative clustering is a clustering algorithm that begins with each point in its own cluster, and iteratively joins clusters until there is only one cluster left.</p>
          <p> Agglomerative clustering does not require the user to input any parameters.</p>
          <p> The iterative step has only one part, at each step, the algorithm find the closest two points, and joins their respective clusters.</p>
          <p> The iteration process may be stopped at any point, when the user decides that the clustering is complete. Eventually, if the user never stops the clustering, there will be only one cluster left, containing all the points.</p>
        </Container>
      </>,
      <>
        <Container elevation={4} sx={{margin: "0vw", backgroundColor: "#85a5d4"}}>
          <h3 style={{margin: 0, marginBottom: "1vw"}}>Mean-Shift</h3>
        </Container>
        <Container sx={{fontFamily: 'Ubuntu'}}>
          <p> Mean Shift clustering is an algorithm that uses sliding "windows" that progressively move towards centers of high density.</p>
          <p> Mean Shift clustering requires that the user provide a radius for the sliding windows, which will be stored in the variable "r".</p>
          <p> First, a set of circular sliding windows of radius are are initialized evenly throughout the grid of data.</p>
          <p> The iterative step has one part. Each sliding window calculates the average location points contained within it, and a "x" is placed there to mark the location. Then, the sliding window is repositioned to be centered at the "x"</p>
          <p> The iterative step is done until none of the sliding windows move by any significant margin. Once this is complete, there are many ways to cluster the data based on the final location of the sliding windows.</p>
        </Container>
      </>,,];
    this.colorMappings = ["white", "black"];
    for (let i = 0; i<420; i++){
      this.colorMappings.push("#" + Math.floor(14550000 + (i*97777)%2227215).toString(16));
    }
    this.state = {
      algType: 0,
      n: 1,
      algDesciption: this.algDescriptions[0],
      sliderValue: 4,
      isPaused: 1,
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
          <Pagination count={5} type="outlined" color="secondary"/>
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
            <Button onClick={()=>{this.mean_shift(10)}}>Run Algorithm</Button>
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

      <Box style={{
          position: "absolute"
        }}>
        <Stack direction="row" spacing={3}>
          <Slide in={this.state.algType === 1} timeout={500} direction="down" mountOnEnter unmountOnExit>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
              <Button onClick={()=>{this.agglomerative()}}>Run Algorithm</Button>
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
          <MenuItem value={1}>Agglomerative</MenuItem>
          <MenuItem value={2}>Mean-Shift</MenuItem>
          <MenuItem value={3}>DBSCAN</MenuItem>
        </Select>
      </FormControl>
      {this.manageOptions()}
    </Stack> < /AppBar>
    <Box sx={{backgroundColor: "#edfcff", paddingTop: "1vw"}}>
      <Paper elevation={6} sx={{display: "inline-block", verticalAlign: "top", width: "21vw", height: "43vw", backgroundColor: "#edfcff", margin: "1vw", paddingBottom: "2vw"}}>
          {this.algDescriptions[this.state.algType]}
      </Paper>
      <Paper elevation={6} sx={{display: "inline-block", verticalAlign: "top", width: "45vw", height: "45vw", backgroundColor: "#edfcff", margin: "1vw"}}>
        <Grid style={{width: "45vw", height: "45vw", borderRadius: "1px"}} background="#edfcff" gridState={this.gridState}
                    changeGrid={this.changeGrid} gridAnimations={this.gridAnimations} deleteAnimation={this.deleteAnimation} sliderValue={this.state.sliderValue} isPaused={this.state.isPaused}>
        </Grid>
      </Paper>
      <Paper elevation={6} sx={{display: "inline-block", verticalAlign: "top", width: "23vw", height: "45vw", backgroundColor: "#edfcff", margin: "1vw"}}>
        <Box sx={{padding: "1vw"}}>
          <Typography id="non-linear-slider" gutterBottom>
            {'Animation Speed: ' + this.calculateSliderValue(this.state.sliderValue)+'x'}
          </Typography>
          <Slider
            value={this.state.sliderValue}
            min={1}
            step={1}
            max={10}
            scale={this.calculateSliderValue}
            getAriaValueText={(value) => value+'x'}
            valueLabelFormat={(value) => value+'x'}
            onChange={this.handleSliderChange}
            valueLabelDisplay="auto"
            aria-labelledby="non-linear-slider"
          />
        </Box>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button onClick={()=>{this.setState({isPaused:0})}}>Pause</Button>
          <Button onClick={()=>{this.setState({isPaused:1})}}>Play</Button>
        </ButtonGroup>
      </Paper>
    </Box>
    </>);
  }
}
