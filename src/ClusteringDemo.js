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
  Container
} from '@mui/material';
import Grid from './Grid.js';

export default class ClusteringDemo extends React.Component {

  changeAlg = (function(event) {
    this.setState({algType: event.target.value})
    console.log("hi")
  }).bind(this);

  constructor(props) {
    super(props);
    this.state = {
      algType: 0
    };
  }

  manageOptions() {
    return (<Box type="span">
      <Box style={{
          position: "absolute"
        }}>
        <Slide in={this.state.algType === 0} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <InputLabel id="pagination-label" shrink={true}>Number of Clusters</InputLabel>
        </Slide>
        <Slide in={this.state.algType === 0} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <Pagination count={10} color="primary"/>
        </Slide>
      </Box>
      <Box style={{
          position: "absolute"
        }}>
        <Slide in={this.state.algType === 2} timeout={500} direction="down" mountOnEnter unmountOnExit>
          <TextField id="mean-shift-radius" label="Radius" variant="standard"/>
        </Slide>
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
        <Grid style={{width: "45vw", height: "45vw", borderRadius: "1px"}} background="#e3fdff">
        </Grid>
      </Paper>
      <Paper elevation={6} sx={{display: "inline-block", width: "23vw", height: "45vw", backgroundColor: "#e3fdff", margin: "1vw"}}>
      </Paper>
    </Box>
    </>);
  }
}
