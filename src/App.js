import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from'./components/Navigation/Navigation';
import Signin from'./components/Signin/Signin';
import Register from'./components/Register/Register';
import FaceRecognition from'./components/FaceRecognition/FaceRecognition';
import Logo from'./components/Logo/Logo';
import ImageLinkForm from'./components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Modal from './components/Modal/Modal';
import Profile from './components/Profile/Profile';
import './App.css';

const particlesOptions = { /**using outside particles library*/
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        value_area: 800
      }  
    }
  }
}
const initialState = {
  input: '',
  imageUrl:'',
  boxes: [],
  route: 'home',
  isSignedIn: true,
  isProfileOpen: false,
  user: {
    id: '',
    name: '',
    email:'',
    entries: 0,
    joined: ''
  } 
}


class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocations = (data) => {
    return data.outputs[0].data.regions.map(face => {
      const clarifaiFace = face.region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
    })
  }
  
  displayFaceBoxes = (boxes) => {
    this.setState({boxes: boxes});
  }
  /*event.target.value is equal to the text box input*/
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }
  
  onButtonSubmit = () => { /**imageurl is from the Security Review
                            */
    this.setState({imageUrl: this.state.input});
      fetch('https://aqueous-everglades-55745.herokuapp.com/imageurl', {
          method: 'post',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            input: this.state.input
          })
        })
      .then(response => response.json())
      .then(response => {
        if(response) {
         fetch('https://aqueous-everglades-55745.herokuapp.com/image', {
           method: 'put',
           headers: {'Content-Type':'application/json'},
           body: JSON.stringify({
             id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => { /*response.json returns  a Promise
                            and the value of count if provided for us now*/
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
      }
      this.displayFaceBoxes(this.calculateFaceLocations(response))
    })
    .catch(err => console.log(err));  

  }

  /*here, we make a callback function to switch between app components,
  we simply set the state of route varible not equal to signin
  , so the other components are rendered*/
  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});  
  }

  toggleModal = () => {
    this.setState(prevState => ({
      ...prevState,
      isProfileOpen: !prevState.isProfileOpen
    }))
  }

/* we have to dynamically pass in state and change it to what we give it*/

  render() {
    const { isSignedIn, imageUrl, route, boxes, isProfileOpen } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
              params={particlesOptions}
        />
        <Navigation isSignedIn = {isSignedIn} onRouteChange = {this.onRouteChange}
          toggleModal={this.toggleModal} />
        { isProfileOpen &&
          <Modal>
            <Profile isProfileOpen={isProfileOpen} toggleModal={this.toggleModal}/>
          </Modal>
        }
        { route === 'home' /*conditonal rendering in jsx, cant use an if statement*/
          ? <div> 
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit ={this.onButtonSubmit} 
              />
              <FaceRecognition boxes ={boxes} imageUrl = {imageUrl}/>
            </div>
          :(
            this.state.route === 'signin'  
            ? <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/> 
            : <Register loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/> 
           )
        }
      </div>
    );
  }
}

export default App;
