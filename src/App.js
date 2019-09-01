import React, {Component} from 'react';
import Navigation from './components/navigation/navigation';
import Logo from "./components/logo/logo";
import ImageLinkForm from './components/imageLinkForm/imageLinkForm';
import Rank from './components/rank/rank';
import FaceRecognition from './components/faceRecognition/faceRecognition';
import SignIn from './components/signIn/signIn';
import Register from './components/register/register';
import Clarifai from 'clarifai';
import Particles from "react-particles-js";
import './App.css';

const app = new Clarifai.App({
    apiKey: 'bace6c4f7d484d43ae616437ea251b5e'
});

const particlesOptions = {
    particles: {
        number: {
            value: 50,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signIn',
            isSignedIn: false
        }
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputImage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    };

    displayFaceBox = (box) => {
        console.log(box);
        this.setState({box: box});
    };

    onInputChange = (event) => {
        this.setState({input: event.target.value});
    };

    onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input});
        app.models.predict(
            Clarifai.FACE_DETECT_MODEL,
            this.state.input)
            .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
            .catch(err => console.log(err));
    };

    onRouteChange = (route) => {
        if (route === 'signOut') {
            this.setState({isSignedIn: false});
        } else if (route === 'home') {
            this.setState({isSignedIn: true});
        }
        this.setState({route: route});
    };

    render() {
        const { isSignedIn, imageUrl, route, box } = this.state;
        return (
            <div className="App">
                <Particles className='particles' params={particlesOptions}/>
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
                {this.state.route === 'home'
                    ? <div>
                        <Logo/>
                        <Rank/>
                        <ImageLinkForm
                            onInputChange={this.onInputChange}
                            onButtonSubmit={this.onButtonSubmit}/>
                        <FaceRecognition box={box} imageUrl={imageUrl}/>
                    </div>
                    : (
                        route === 'signIn'
                        ? <SignIn onRouteChange={this.onRouteChange}/>
                        : <Register onRouteChange={this.onRouteChange}/>
                    )

                }
            </div>
        );
    }
}

export default App;
