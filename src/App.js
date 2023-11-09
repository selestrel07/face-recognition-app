import './App.css';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm.js';
import Rank from './components/rank/Rank.js';
import FaceRecognition from './components/facerecognition/FaceRecognition.js';
import SignIn from './components/signin/SignIn.js';
import Register from './components/register/Register.js';
import ParticlesBg from 'particles-bg';
import { Component } from 'react';
class App extends Component {

  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  MODEL_ID = 'face-detection'; 

  loadUser = (data) => {
    this.setState({ user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  returnClarifaiRequestOptions = (imageUrl) => {
    const PAT = '9069e85c21cd43efaeed1ac125a78984';
    const USER_ID = 'selestrel';       
    const APP_ID = 'test';
    const IMAGE_URL = imageUrl;

    const raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
  });

  const requestOptions = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
  };

  return requestOptions;
}

  onInputChange = (Event) => {
    this.setState({ input: Event.target.value})
  }

  calculateFaceLocation = (response) => {
    const clarifaiFace = response.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input })
    fetch("https://api.clarifai.com/v2/models/" + this.MODEL_ID + "/outputs", this.returnClarifaiRequestOptions(this.state.input))
        .then(response => response.json())
        .then(response => {
          console.log(response);
          if (response) {
            fetch('http://localhost:3003/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  id: this.state.user.id
              })})
                .then(response => response.json())
                .then(count => {
                  this.setState(Object.assign(this.state.user, {entries: count}))
                });
            this.displayFaceBox(this.calculateFaceLocation(response));
          }
        })
        .catch(error => console.log('error', error));
  }

  onRouteChange = (route) => {
    if (route === 'signin' || route === 'register') {
      this.setState({ isSignedIn: false});
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, box, imageUrl, route} = this.state;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" bg={true} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        { route === 'home'
        ? <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries} />
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
        <FaceRecognition box={box} imageUrl={imageUrl} />
      </div>
        : (route === "signin"
        ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>)
        }
      </div>
    );
  }
}

export default App;
