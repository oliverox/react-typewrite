import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TypeWrite from '../src/index';
import logo from './logo.svg';
import './demo.css';

class Demo extends Component {
  constructor() {
    super()
    this.state = {
      pause: true
    }
  }

  componentDidMount() {
    // For sake of this demo,
    // start typing animation after 2s
    window.setTimeout(function() {
      console.log('will now unpause');
      this.setState({
        pause: false
      });
    }.bind(this), 2000);
  }

  render() {
    const {pause} = this.state;
    return (
      <div className="demo">
        <div className="demo-header">
          <img src={logo} className="demo-logo" alt="logo" />
          <span className="demo-title">Component Demo</span>
        </div>
        <div style={{padding: 10}}>
          <h3 style={{color: 'orange'}}>
            <TypeWrite pause={pause}>
              <span backspace={0}>Lorem ipsum</span>
              <span stamp style={{color: 'hotpink'}}>dolor</span>
            </TypeWrite>
          </h3>
          {/* <TypeWrite>Hello1 <span>there!</span></TypeWrite> */}
          {/* <TypeWrite pause={pause}>
            <div>Hello there!</div>
            <p style={{color: 'blue'}}>How are you?</p>
          </TypeWrite> */}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Demo />,
  document.getElementById('root')
);
